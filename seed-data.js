const fs = require('fs');
const path = require('path');

const products = [
  {
    id: 'lefon-electric-pan',
    name: 'LEFON Multifunctional Electric Pan (32CM / 8L)',
    brand: 'LEFON',
    category: 'Cooking Appliances',
    subcategory: 'Electric Pans & Skillets',
    price: 680,
    originalPrice: 850,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Best Seller',
    image: '/images/lefon-electric-pan.png',
    inStock: true,
    stockCount: 14,
    colors: ['Rose Gold Luxury', 'Matte Obsidian Black'],
    power: '1500W',
    capacity: '8 Liters (32cm Diameter)',
    shortDesc: 'Extra-deep 8L 1500W electric cooking pan for frying, grilling, roasting, stewing, braising & steaming.',
    description: 'The flagship centerpiece of Pearls Gift Collection. The LEFON 32CM Multifunctional Electric Pan delivers 1500W of rapid, uniform heating across an extra-deep 8-liter non-stick diamond-textured cooking surface. Whether you are preparing grand party Jollof rice, rich light soup, fried chicken, grilled tilapia, or steaming vegetables, this pan does it all with effortless temperature control and cool-touch handles.',
    features: [
      '1500W High Efficiency Rapid Heating Element',
      'Massive 8-Liter / 32CM Extra-Deep Vessel',
      'Multifunctional 8-in-1: Frying, Grilling, Roasting, Braising, Stewing, Steaming, Boiling & Poaching',
      'Food-Grade Ceramic Diamond Textured Non-Stick Coating',
      'Tempered Glass Lid with Steam Release Vent & Standing Knob Handle',
      'Detachable 5-Level Precision Thermostat Controller',
      'Dual Ergonomic Heat-Resistant Carry Handles'
    ],
    specs: {
      'Model': 'LEFON 32CM-8L',
      'Power Rating': '1500W, 220-240V, 50/60Hz',
      'Capacity': '8 Liters',
      'Diameter': '32 cm',
      'Coating': 'Diamond Pattern Non-Stick Ceramic',
      'Lid': 'Heavy Duty Tempered Glass'
    }
  },
  {
    id: 'masterchef-countertop-suite',
    name: 'MasterChef All-in-One Kitchen Appliance Suite',
    brand: 'Pearls Culinary Selection',
    category: 'Cooking Appliances',
    subcategory: 'Countertop Essentials',
    price: 2950,
    originalPrice: 3400,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Complete Suite',
    image: '/images/countertop-appliances.png',
    inStock: true,
    stockCount: 8,
    colors: ['Classic Kitchen Silver & Black'],
    power: 'Multi-Appliance Suite',
    capacity: 'Complete Kitchen Setup',
    shortDesc: 'Comprehensive electrical countertop collection: Rice cooker, toaster oven, stand mixer, coffee maker, air fryer & more.',
    description: 'The ultimate wedding, housewarming, or full kitchen upgrade package from Pearls Gift Collection. This collection gathers all essential culinary electronics: digital convection oven, programmable coffee maker, electric rice cooker, stand mixer with stainless mixing bowl, digital air fryer, slow cooker, juicer extractor, personal smoothie blender, multi-jar spice grinder, and microwave oven.',
    features: [
      'Electric Floral Rice Cooker with Automatic Warm Mode & Steamer Basket',
      'Countertop Convection Toaster Oven with Rotisserie Spits',
      '12-Cup Programmable Drip Coffee Maker with Thermal Carafe',
      'Heavy-Duty Stand Mixer with Stainless Steel Mixing Bowl',
      'Digital Rapid Hot-Air Fryer with Preset Touch Controls',
      'Oval Ceramic Slow Cooker / Crock Pot for Tender Stews',
      'Whole Fruit High-Yield Centrifugal Juice Extractor',
      'Heavy Duty Multi-Jar Wet & Dry Spice Mixer Grinder',
      'Personal Single-Serve Bullet Smoothie Blender with To-Go Cups',
      'Compact Digital Touch Microwave Oven'
    ],
    specs: {
      'Package Type': 'Full Kitchen Appliance Bundle',
      'Voltage': '220-240V Standard Ghana Domestic Voltage',
      'Warranty': '12 Months Store Warranty',
      'Delivery': 'Free Delivery Within Accra'
    }
  },
  {
    id: 'gourmet-prep-collection',
    name: 'Gourmet Chef Prep & Culinary Appliance Collection',
    brand: 'Pearls Elite Gourmet',
    category: 'Utensils & Prep',
    subcategory: 'Blenders & Food Processors',
    price: 1850,
    originalPrice: 2200,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Chef Choice',
    image: '/images/gourmet-appliances.png',
    inStock: true,
    stockCount: 11,
    colors: ['Brushed Stainless Steel & Charcoal'],
    power: 'Professional Grade',
    capacity: 'Gourmet Prep Set',
    shortDesc: 'Commercial blenders, immersion stick blenders, panini grill, food processor, electric kettle & digital air fryer.',
    description: 'Engineered for high-tempo food preparation and precision culinary craft. Features heavy-duty immersion stick blender with multi-attachments, smart digital convection countertop oven, high-grade panini press / contact grill, commercial-speed blender with tamper, multi-blade food processor, fast-boil stainless kettle, and touchscreen digital air fryer.',
    features: [
      'Commercial-Grade High-Torque Multi-Speed Blender',
      'Ergonomic Immersion Hand Blender with Whisk & Chopper Accessories',
      'Smart Convection Countertop Air-Fryer Toaster Oven',
      'Heavy-Duty Double-Sided Panini Press & Indoor Reversible Grill',
      'Multi-Disc Precision Food Processor for Rapid Slicing & Shredding',
      'Rapid Boil 1.7L Cordless Stainless Steel Electric Kettle',
      'Digital Touchscreen Air Fryer with Crisping Basket'
    ],
    specs: {
      'Material': 'Stainless Steel & BPA-Free Tritan',
      'Motor': 'Copper-Wound High Performance Motors',
      'Safety': 'Overheat Protection & Safety Interlocks',
      'Origin': 'Certified European / Asian Import'
    }
  },
  {
    id: 'outdoor-rattan-patio-set',
    name: 'Luxury 5-Piece Outdoor Woven Rattan Dining Set',
    brand: 'Outliving Exclusive',
    category: 'Home & Patio Living',
    subcategory: 'Outdoor Furniture',
    price: 3800,
    originalPrice: 4500,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Luxury Living',
    image: '/images/outdoor-rattan-set.jpg',
    inStock: true,
    stockCount: 5,
    colors: ['Obsidian Black Weave'],
    power: 'N/A',
    capacity: '4 Persons Dining Set',
    shortDesc: 'Weather-resistant black woven wicker patio set: 4 deep-seat armchairs + square tempered-glass dining table.',
    description: 'Elevate your Accra veranda, terrace, poolside, or garden compound with this exquisite 5-piece rattan dining set. Handwoven with high-density UV-resistant synthetic polyethylene wicker around a powder-coated rustproof steel frame. Features a square dining table topped with heavy tempered glass and four contoured, comfortable armchairs.',
    features: [
      'Handcrafted All-Weather PE Rattan Wicker in Elegant Obsidian Black',
      'High-Strength Powder-Coated Rust-Resistant Reinforced Steel Structure',
      'Square Glass-Top Table with Center Planter Pot Accent Well',
      '4 Deep-Contoured Ergonomic Armchairs with Curved Backrests',
      'UV Protected Against Tropical Sunlight & Mildew Resistant',
      'Non-Scratch Floor Protectors on All Chair & Table Legs',
      'Zero Maintenance Required: Easy Soap & Water Wipe Down'
    ],
    specs: {
      'Table Dimensions': '90cm x 90cm x 75cm (H)',
      'Chair Dimensions': '58cm x 60cm x 82cm (H)',
      'Glass Type': '5mm Beveled Tempered Safety Glass',
      'Frame': '1.2mm Heavy Gauge Steel'
    }
  },
  {
    id: 'folding-banquet-event-set',
    name: 'Heavy-Duty 6-Foot Folding Banquet Table & 4-Chair Set',
    brand: 'Pearls Event Series',
    category: 'Event & Utility',
    subcategory: 'Folding Furniture',
    price: 1450,
    originalPrice: 1750,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'High Demand',
    image: '/images/folding-event-table-chairs.png',
    inStock: true,
    stockCount: 15,
    colors: ['Granite White Table / Matte Black Chairs'],
    power: 'N/A',
    capacity: '6-8 Persons Seating Capacity',
    shortDesc: 'Commercial 6ft blow-molded fold-in-half utility table with 4 cushioned metal folding event chairs.',
    description: 'The quintessential Ghanaian household and event essential. Perfect for family Sunday gatherings, birthday parties, church programs, outdoor catering, or temporary kitchen prep space. Features a heavy-duty blow-molded resin 6-foot folding table that folds compactly in half with a carry handle, accompanied by 4 reinforced steel folding chairs with padded cushions.',
    features: [
      'Heavy-Duty 6-Foot (183cm) High-Density Polyethylene Tabletop',
      'Fold-in-Half Portable Design with Sturdy Integrated Carrying Strap',
      '4 Reinforced Powder-Coated Steel Frame Folding Chairs with Cushioned Seats',
      'Table Weight Capacity: 300 kg (660 lbs)',
      'Waterproof, Stain-Resistant & UV-Protected Tabletop',
      'Self-Locking Safety Rings on All Table Leg Braces',
      'Non-Marring Rubber Foot Caps Prevent Floor Scratches'
    ],
    specs: {
      'Table Open Size': '183cm (L) x 76cm (W) x 74cm (H)',
      'Table Folded Size': '92cm x 76cm x 8.5cm',
      'Chair Cushion': 'Double-Stitched Vinyl with High-Density Foam',
      'Weight': 'Table: 12.5 kg | Chairs: 3.8 kg each'
    }
  },
  {
    id: 'digital-air-fryer-touch',
    name: 'Smart Touchscreen Rapid Air Fryer (6.5L)',
    brand: 'Pearls Culinary',
    category: 'Cooking Appliances',
    subcategory: 'Air Fryers & Fryers',
    price: 720,
    originalPrice: 900,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Healthy Cooking',
    image: '/images/gourmet-appliances.png',
    inStock: true,
    stockCount: 20,
    colors: ['Matte Black / Chrome Accent'],
    power: '1800W',
    capacity: '6.5 Liters',
    shortDesc: 'Crisp fried chicken, plantains (kelewele), fish and pastries with 85% less oil.',
    description: 'Cook healthier without sacrificing taste. The 6.5-liter digital air fryer uses 360-degree rapid vortex heat circulation to deliver golden crispy results with up to 85% less oil. Includes 8 intelligent one-touch presets for meat, chicken, seafood, fries, vegetables, and baking.',
    features: [
      '360° Cyclone Air Circulation for Maximum Crispness',
      'Digital LED Touch Display with 8 Quick-Select Presets',
      'Detachable Non-Stick Food Basket (Dishwasher Safe)',
      'Auto Shut-Off and Overheat Safety Sensors'
    ],
    specs: {
      'Power': '1800W',
      'Capacity': '6.5L',
      'Timer': '0-60 minutes',
      'Temperature': '80°C - 200°C'
    }
  },
  {
    id: 'heavy-duty-commercial-blender',
    name: 'Commercial High-Speed Spice & Smoothie Blender (2200W)',
    brand: 'Pearls Culinary',
    category: 'Utensils & Prep',
    subcategory: 'Blenders & Grinders',
    price: 650,
    originalPrice: 800,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Popular',
    image: '/images/gourmet-appliances.png',
    inStock: true,
    stockCount: 18,
    colors: ['Obsidian Black'],
    power: '2200W Heavy Duty',
    capacity: '2.0 Liters Unbreakable Jug',
    shortDesc: 'Crush ice, dry spices, ginger, garlic, pepper and tiger nuts in seconds with heavy 2200W copper motor.',
    description: 'Designed specifically for hearty West African cooking. Effortlessly blend dried pepper, ginger, garlic, tomatoes, and soaked tiger nuts into velvet smooth textures. Unbreakable BPA-free 2-liter pitcher with hardened 6-blade Japanese stainless steel assembly.',
    features: [
      '2200W Pure Copper High-Torque Motor',
      'Indestructible 2-Liter Food-Grade Polycarbonate Pitcher',
      '6 Wave-Action Hardened Stainless Blades',
      'Variable Speed Dial + Pulse Toggle Switch'
    ],
    specs: {
      'Motor': '2200W Peak',
      'RPM': 'Up to 32,000 RPM',
      'Jug Capacity': '2000 ml'
    }
  },
  {
    id: 'deluxe-cordless-kettle',
    name: 'Fast-Boil Cordless Stainless Steel Electric Kettle (1.8L)',
    brand: 'Pearls Essentials',
    category: 'Cooking Appliances',
    subcategory: 'Kettles & Tea',
    price: 195,
    originalPrice: 260,
    currency: 'GHS',
    rating: 5.0,
    reviewCount: 2,
    badge: 'Everyday Value',
    image: '/images/gourmet-appliances.png',
    inStock: true,
    stockCount: 30,
    colors: ['Brushed Stainless Steel'],
    power: '1500W',
    capacity: '1.8 Liters',
    shortDesc: 'Fast-boil 1.8L kettle with 360-degree swivel base and automatic shut-off safety.',
    description: 'Boil water for tea, morning coffee, or quick cooking in under 3 minutes. Features food-grade 304 stainless steel interior, cool-touch handle, blue LED power indicator, and Strix safety controller.',
    features: [
      'Premium 304 Food-Grade Stainless Steel Body',
      'Automatic Steam Shut-Off & Boil-Dry Protection',
      '360° Rotational Base with Cord Storage Compartment',
      'Ergonomic Heat-Insulated Handle with Easy Open Lid Button'
    ],
    specs: {
      'Power': '1500W',
      'Capacity': '1.8 Liters',
      'Voltage': '220-240V'
    }
  }
];

const reviews = [
  {
    id: 'rev-1',
    author: 'Akosua Mensah',
    location: 'East Legon, Accra',
    rating: 5,
    date: '2026-09-18',
    verified: true,
    comment: 'I bought the LEFON 32cm electric pan from Pearls Gift Collection and delivery to East Legon was under 3 hours! It cooked Sunday Jollof for my whole family with zero burning. Truly 5 stars quality and very polite customer service on WhatsApp.'
  },
  {
    id: 'rev-2',
    author: 'Kwame Osei-Tutu',
    location: 'Spintex Road, Accra',
    rating: 5,
    date: '2026-09-29',
    verified: true,
    comment: 'Exceptional appliances and utensils store right here in Accra. I picked up the commercial blender and the folding table set for our catering business. Top tier durability, genuine items, and great communication via 055 878 8083. Highly recommended!'
  }
];

const storeInfo = {
  name: 'Pearls Gift Collection',
  rating: 5.0,
  reviewCount: 2,
  category: 'Cooking appliances and utensils store',
  location: 'Accra, Ghana',
  landmark: 'Accra Central & Greater Accra Metro Delivery Hub',
  phone: '055 878 8083',
  phoneInternational: '+233 55 878 8083',
  whatsapp: '233558788083',
  openingTime: '08:00',
  closingTime: '20:00',
  hoursDisplay: 'Open Daily · Closes 8:00 PM',
  currency: 'GH₵',
  delivery: {
    available: true,
    coverage: 'Accra Metro & Nationwide Ghana Delivery',
    zones: [
      { id: 'pickup', name: 'Store Pickup (Accra Hub)', fee: 0, time: 'Same day (Call before coming)' },
      { id: 'central', name: 'Accra Central / Osu / Labone / Ridge', fee: 25, time: '2 - 4 hours' },
      { id: 'legon', name: 'East Legon / Airport / Dzorwulu / Roman Ridge', fee: 30, time: '2 - 4 hours' },
      { id: 'spintex', name: 'Spintex / Tema / Sakumono / Baatsona', fee: 35, time: 'Same day' },
      { id: 'madina', name: 'Madina / Adenta / Haatso / Ashaley Botwe', fee: 35, time: 'Same day' },
      { id: 'lapaz', name: 'Lapaz / Achimota / Darkuman / Dansoman', fee: 30, time: '2 - 4 hours' },
      { id: 'kasoa', name: 'Kasoa / Weija / Mallam / McCarthy Hill', fee: 45, time: 'Same day' },
      { id: 'intercity', name: 'Intercity Dispatch (Kumasi, Takoradi, Tamale, etc.)', fee: 60, time: '24 - 48 hours via VIP/STC' }
    ]
  },
  paymentMethods: [
    { id: 'cod', name: 'Cash on Delivery (Accra)', icon: 'cash' },
    { id: 'momo_mtn', name: 'MTN Mobile Money (MoMo)', icon: 'momo' },
    { id: 'momo_telecel', name: 'Telecel Cash (Vodafone)', icon: 'telecel' },
    { id: 'whatsapp_direct', name: 'Order & Pay via WhatsApp', icon: 'whatsapp' }
  ]
};

const orders = [];

fs.writeFileSync(path.join(__dirname, 'data', 'products.json'), JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'data', 'reviews.json'), JSON.stringify(reviews, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'data', 'store-info.json'), JSON.stringify(storeInfo, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'data', 'orders.json'), JSON.stringify(orders, null, 2), 'utf8');

console.log('Data initialized successfully!');
