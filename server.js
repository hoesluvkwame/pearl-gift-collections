const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory cache for serverless environments (e.g. Vercel)
const memoryStore = {};

// Helper to read JSON data safely
function readJson(filename) {
  if (memoryStore[filename]) {
    return memoryStore[filename];
  }
  const filePath = path.join(__dirname, 'data', filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    memoryStore[filename] = data;
    return data;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

// Helper to write JSON data safely
function writeJson(filename, data) {
  memoryStore[filename] = data;
  const filePath = path.join(__dirname, 'data', filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`Filesystem write skipped (Serverless/Vercel read-only environment): ${err.message}`);
  }
}

// Check live store open/close status in Accra (GMT, UTC+0)
function checkStoreStatus(storeInfo) {
  const now = new Date();
  // Ghana is GMT / UTC+0 all year round
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const currentMinutes = utcHours * 60 + utcMinutes;

  const [openH, openM] = storeInfo.openingTime.split(':').map(Number);
  const [closeH, closeM] = storeInfo.closingTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  
  const formattedTime = `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')} GMT`;

  return {
    isOpen,
    statusText: isOpen ? 'Open Now · Closes 8:00 PM' : 'Closed Now · Opens 8:00 AM',
    accraTime: formattedTime
  };
}

// API: Store Info & Operating Status
app.get('/api/store-info', (req, res) => {
  const storeInfo = readJson('store-info.json');
  const status = checkStoreStatus(storeInfo);
  res.json({
    ...storeInfo,
    liveStatus: status
  });
});

// API: Categories List
app.get('/api/categories', (req, res) => {
  const products = readJson('products.json');
  const catMap = {};
  products.forEach(p => {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
  });
  const categories = Object.keys(catMap).map(name => ({
    name,
    count: catMap[name]
  }));
  res.json({
    totalProducts: products.length,
    categories
  });
});

// API: Products List with Filtering & Search
app.get('/api/products', (req, res) => {
  let products = readJson('products.json');
  const { category, search, minPrice, maxPrice, sort, inStock } = req.query;

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(q)))
    );
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  if (inStock === 'true') {
    products = products.filter(p => p.inStock);
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    count: products.length,
    products
  });
});

// API: Single Product Details
app.get('/api/products/:id', (req, res) => {
  const products = readJson('products.json');
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// API: Place Order & Generate WhatsApp Message
app.post('/api/orders', (req, res) => {
  const { customerName, phone, deliveryAddress, deliveryZoneId, paymentMethod, notes, items, selectedColor } = req.body;

  if (!customerName || !phone || !items || !items.length) {
    return res.status(400).json({ error: 'Name, phone number, and items are required.' });
  }

  const storeInfo = readJson('store-info.json');
  const products = readJson('products.json');
  const orders = readJson('orders.json');

  // Find delivery zone
  let deliveryZone = storeInfo.delivery.zones.find(z => z.id === deliveryZoneId);
  if (!deliveryZone) {
    deliveryZone = storeInfo.delivery.zones[0]; // fallback
  }

  // Calculate pricing & line items
  let subtotal = 0;
  const detailedItems = items.map(item => {
    const prod = products.find(p => p.id === item.productId);
    const unitPrice = prod ? prod.price : (item.price || 0);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    return {
      productId: item.productId,
      name: prod ? prod.name : item.name,
      price: unitPrice,
      quantity: item.quantity,
      selectedColor: item.selectedColor || null,
      lineTotal
    };
  });

  const deliveryFee = deliveryZone.fee;
  const grandTotal = subtotal + deliveryFee;

  const trackingCode = `PGC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const newOrder = {
    id: 'ord_' + Date.now(),
    trackingCode,
    customerName,
    phone,
    deliveryAddress: deliveryAddress || 'Store Pickup',
    deliveryZone: deliveryZone.name,
    deliveryFee,
    subtotal,
    grandTotal,
    paymentMethod,
    notes: notes || '',
    items: detailedItems,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  writeJson('orders.json', orders);

  // Construct pre-filled WhatsApp message for easy customer contact
  const itemsText = detailedItems.map(i => `• ${i.name} (x${i.quantity})${i.selectedColor ? ' [' + i.selectedColor + ']' : ''} - GH₵ ${i.lineTotal}`).join('\n');
  const waText = 
`*NEW ORDER - PEARLS GIFT COLLECTION*
*Tracking:* ${trackingCode}
*Customer:* ${customerName}
*Phone:* ${phone}
*Delivery Location:* ${deliveryAddress} (${deliveryZone.name})

*Ordered Items:*
${itemsText}

*Subtotal:* GH₵ ${subtotal}
*Delivery Fee:* GH₵ ${deliveryFee}
*Total Payable:* GH₵ ${grandTotal}
*Payment Method:* ${paymentMethod}
${notes ? `*Notes:* ${notes}\n` : ''}
_Please confirm my order delivery. Thank you!_`;

  const whatsappUrl = `https://wa.me/233558788083?text=${encodeURIComponent(waText)}`;

  res.status(201).json({
    success: true,
    trackingCode,
    order: newOrder,
    whatsappUrl
  });
});

// API: Track Order by Tracking Code or Phone
app.get('/api/orders/:identifier', (req, res) => {
  const orders = readJson('orders.json');
  const target = req.params.identifier.trim().toUpperCase();
  const order = orders.find(o => 
    o.trackingCode.toUpperCase() === target || 
    o.phone.replace(/\D/g, '') === target.replace(/\D/g, '')
  );

  if (!order) {
    return res.status(404).json({ error: 'No order found with this tracking code or phone number.' });
  }

  res.json(order);
});

// API: Customer Reviews
app.get('/api/reviews', (req, res) => {
  const reviews = readJson('reviews.json');
  const total = reviews.length;
  const avgRating = total > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
    : '5.0';

  res.json({
    rating: Number(avgRating),
    reviewCount: total,
    reviews
  });
});

// API: Submit Customer Review
app.post('/api/reviews', (req, res) => {
  const { author, location, rating, comment } = req.body;
  if (!author || !comment) {
    return res.status(400).json({ error: 'Author and comment are required.' });
  }

  const reviews = readJson('reviews.json');
  const newRev = {
    id: 'rev-' + Date.now(),
    author,
    location: location || 'Accra, Ghana',
    rating: Number(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    verified: true,
    comment
  };

  reviews.unshift(newRev);
  writeJson('reviews.json', reviews);

  res.status(201).json({ success: true, review: newRev });
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'xxxfree45';

// Admin authentication middleware
function checkAdminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.adminKey;
  if (key === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Manager PIN required' });
}

// API: Verify Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Incorrect PIN/Password' });
  }
});

// API: Admin Orders & Stats (Protected)
app.get('/api/admin/orders', checkAdminAuth, (req, res) => {
  const orders = readJson('orders.json');
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;

  res.json({
    stats: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders
    },
    orders
  });
});

// API: Update Order Status (Protected)
app.patch('/api/admin/orders/:id', checkAdminAuth, (req, res) => {
  const { status } = req.body;
  const orders = readJson('orders.json');
  const orderIndex = orders.findIndex(o => o.id === req.params.id || o.trackingCode === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  writeJson('orders.json', orders);

  res.json({ success: true, order: orders[orderIndex] });
});

// Catch-all for API 404s
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Catch-all route to serve storefront
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listener only when executed directly (e.g. node server.js, not when required as a serverless module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Pearls Gift Collection Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
