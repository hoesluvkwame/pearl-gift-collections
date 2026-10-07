/**
 * Pearls Gift Collection - Luxury Showcase & Inquiries Engine
 * Cooking Appliances & Utensils Store · Accra, Ghana
 */

class PearlsApp {
  constructor() {
    this.products = [];
    this.reviews = [];
    this.storeInfo = null;
    this.currentCategory = 'All';
    this.searchQuery = '';
    this.currentSort = 'featured';
    this.selectedLefonColor = 'Rose Gold';
  }

  async init() {
    this.setupEventListeners();
    await Promise.all([
      this.fetchStoreInfo(),
      this.fetchProducts(),
      this.fetchReviews()
    ]);
  }

  setupEventListeners() {
    // Search and Sort
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderProducts();
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderProducts();
      });
    }

    // Category Tabs
    const catContainer = document.getElementById('categoryTabs');
    if (catContainer) {
      catContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-pill');
        if (!btn) return;
        catContainer.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-category');
        this.renderProducts();
      });
    }

    // Leave review modal trigger
    const leaveRevBtn = document.getElementById('leaveReviewBtn');
    if (leaveRevBtn) {
      leaveRevBtn.addEventListener('click', () => this.openReviewModal());
    }
  }

  async fetchStoreInfo() {
    try {
      const res = await fetch('/api/store-info');
      this.storeInfo = await res.json();
      this.updateStoreInfoUI();
    } catch (err) {
      console.error('Error fetching store info:', err);
    }
  }

  updateStoreInfoUI() {
    if (!this.storeInfo) return;

    // Live Open/Closed badge
    const topLive = document.getElementById('topLiveStatus');
    const hoursBadge = document.getElementById('hoursLiveBadge');
    if (this.storeInfo.liveStatus) {
      const text = this.storeInfo.liveStatus.statusText;
      if (topLive) topLive.textContent = text;
      if (hoursBadge) hoursBadge.textContent = (this.storeInfo.liveStatus.isOpen ? '🟢 ' : '🔴 ') + text;
    }

    if (this.storeInfo.delivery && this.storeInfo.delivery.zones) {
      this.renderDeliveryZonesTable(this.storeInfo.delivery.zones);
    }
  }

  renderDeliveryZonesTable(zones) {
    const table = document.getElementById('deliveryZonesTable');
    if (!table) return;

    let html = `
      <div class="zone-row header">
        <span>Delivery Zone</span>
        <span>Availability</span>
        <span>Estimated Delivery Time</span>
      </div>
    `;

    zones.forEach(z => {
      html += `
        <div class="zone-row">
          <span><strong>${z.name}</strong></span>
          <span class="zone-fee" style="color: #059669;">✓ Active Coverage</span>
          <span>${z.time}</span>
        </div>
      `;
    });

    table.innerHTML = html;
  }

  async fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      this.products = data.products || [];
      const countEl = document.getElementById('countAll');
      if (countEl) countEl.textContent = this.products.length;
      this.renderProducts();
    } catch (err) {
      console.error('Error fetching products:', err);
      const grid = document.getElementById('productsGrid');
      if (grid) grid.innerHTML = `<p class="error-msg">Failed to load products. Please check server connection.</p>`;
    }
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    let filtered = [...this.products];

    // Filter by category
    if (this.currentCategory !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        (p.features && p.features.some(f => f.toLowerCase().includes(this.searchQuery)))
      );
    }

    // Sort
    if (this.currentSort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.currentSort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-products-found" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="font-size: 1.2rem; color: var(--text-muted);">No items found matching your search.</p>
          <button class="btn btn-secondary mt-3" onclick="app.resetFilters()">View All Collections</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const waText = encodeURIComponent(`Hello Pearls Gift Collection! I would like to inquire about the price and delivery for the "${p.name}".`);
      const waUrl = `https://wa.me/233558788083?text=${waText}`;

      return `
        <article class="product-card" data-id="${p.id}">
          ${p.badge ? `<span class="product-card-badge">${p.badge}</span>` : ''}
          <div class="card-image-wrap" onclick="app.openQuickView('${p.id}')">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <button class="quick-view-overlay-btn" type="button">View Details</button>
          </div>
          <div class="product-card-body">
            <span class="product-cat-tag">${p.category}</span>
            <h3 class="product-title" onclick="app.openQuickView('${p.id}')">${p.name}</h3>
            <p class="product-snippet">${p.shortDesc || p.description}</p>
            <div class="product-card-rating">
              <span>★★★★★</span>
              <span>${p.rating.toFixed(1)}</span>
              <span class="text-muted">(${p.reviewCount || 2})</span>
            </div>
            <div class="product-card-footer">
              <div class="card-actions-grid">
                <a href="${waUrl}" target="_blank" rel="noopener" class="btn-card-wa">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>Inquire Price</span>
                </a>
                <button class="btn-card-details" onclick="app.openQuickView('${p.id}')">
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  resetFilters() {
    this.currentCategory = 'All';
    this.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const catContainer = document.getElementById('categoryTabs');
    if (catContainer) {
      catContainer.querySelectorAll('.cat-pill').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-category') === 'All');
      });
    }
    this.renderProducts();
  }

  selectLefonColor(color, el) {
    this.selectedLefonColor = color;
    document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    this.showToast(`Selected color: ${color}`);
  }

  // Quick View Modal (Without Price)
  openQuickView(productId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return;

    const dialog = document.getElementById('quickViewDialog');
    const content = document.getElementById('quickViewContent');
    if (!dialog || !content) return;

    let colorSelectorHtml = '';
    if (prod.colors && prod.colors.length) {
      colorSelectorHtml = `
        <div style="margin: 14px 0;">
          <label style="display:block; font-size: 0.8rem; font-weight:700; margin-bottom: 6px;">Available Color Options:</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${prod.colors.map((c, i) => `
              <span class="color-chip ${i === 0 ? 'active' : ''}">${c}</span>
            `).join('')}
          </div>
        </div>
      `;
    }

    let featuresHtml = '';
    if (prod.features && prod.features.length) {
      featuresHtml = `
        <div style="margin: 16px 0;">
          <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 6px;">Key Features:</h4>
          <ul style="padding-left: 20px; font-size: 0.84rem; color: var(--text-muted); line-height: 1.5;">
            ${prod.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    let specsHtml = '';
    if (prod.specs) {
      specsHtml = `
        <div style="margin: 16px 0; background: var(--bg-page); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; color: var(--gold);">Product Specifications:</h4>
          ${Object.entries(prod.specs).map(([k, v]) => `
            <div style="display:flex; justify-content:space-between; font-size: 0.8rem; padding: 3px 0; border-bottom: 1px solid var(--border-light);">
              <span style="color: var(--text-muted);">${k}</span>
              <strong style="color: var(--primary);">${v}</strong>
            </div>
          `).join('')}
        </div>
      `;
    }

    const waText = encodeURIComponent(`Hello Pearls Gift Collection! I would like to inquire about the price and availability for the "${prod.name}".`);
    const waUrl = `https://wa.me/233558788083?text=${waText}`;

    content.innerHTML = `
      <div class="dialog-header">
        <span class="step-badge">${prod.category}</span>
        <button class="btn-close" onclick="app.closeDialog('quickViewDialog')">&times;</button>
      </div>
      <div class="quick-view-grid">
        <div class="quick-view-media">
          <img src="${prod.image}" alt="${prod.name}">
        </div>
        <div>
          <h2 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--primary); margin-bottom: 8px;">${prod.name}</h2>
          <div style="display:flex; gap: 8px; align-items:center; margin-bottom: 12px;">
            <span style="color: #059669; font-weight: 700; font-size: 0.8rem; background: #ECFDF5; padding: 2px 8px; border-radius: 999px;">✓ In Stock in Accra</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Brand: <strong>${prod.brand || 'Pearls Collection'}</strong></span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">${prod.description}</p>
          ${colorSelectorHtml}
          ${featuresHtml}
          ${specsHtml}
          <div style="display:flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>Inquire Price on WhatsApp</span>
            </a>
            <a href="tel:0558788083" class="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Call 055 878 8083</span>
            </a>
          </div>
        </div>
      </div>
    `;

    dialog.showModal();
  }

  closeDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog && dialog.close) dialog.close();
  }

  // Reviews
  async fetchReviews() {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      this.reviews = data.reviews || [];
      this.renderReviews();
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }

  renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    grid.innerHTML = this.reviews.map(r => `
      <div class="review-card">
        <div class="review-card-top">
          <div class="review-author-wrap">
            <div class="author-avatar">${r.author.charAt(0)}</div>
            <div class="author-info">
              <h4>${r.author}</h4>
              <span>${r.location}</span>
            </div>
          </div>
          <span class="verified-pill">✓ Verified Buyer</span>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-comment">"${r.comment}"</p>
        <span class="review-date">${r.date}</span>
      </div>
    `).join('');
  }

  openReviewModal() {
    const dialog = document.getElementById('reviewDialog');
    if (dialog) dialog.showModal();
  }

  async handleReviewSubmit(e) {
    e.preventDefault();
    const payload = {
      author: document.getElementById('revAuthor').value.trim(),
      location: document.getElementById('revLocation').value.trim(),
      rating: Number(document.getElementById('revRating').value),
      comment: document.getElementById('revComment').value.trim()
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        this.closeDialog('reviewDialog');
        this.reviews.unshift(data.review);
        this.renderReviews();
        this.showToast('Thank you! Your review has been submitted.');
        document.getElementById('reviewForm').reset();
      }
    } catch (err) {
      alert('Error submitting review.');
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }
}

// Initialize App
const app = new PearlsApp();
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
