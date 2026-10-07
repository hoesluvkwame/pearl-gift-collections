/**
 * Store Manager Portal Engine - Pearls Gift Collection
 */

class AdminDashboard {
  constructor() {
    this.orders = [];
    this.currentFilter = 'All';
    this.searchQuery = '';
    this.token = sessionStorage.getItem('pearls_admin_token') || null;
  }

  async init() {
    if (!this.token) {
      this.showAuthModal(true);
    } else {
      this.showAuthModal(false);
      await this.refreshData();
    }
  }

  showAuthModal(show) {
    const overlay = document.getElementById('adminAuthOverlay');
    const logoutBtn = document.getElementById('logoutBtn');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
    if (logoutBtn) logoutBtn.style.display = show ? 'none' : 'inline-block';
  }

  async handleLogin(e) {
    e.preventDefault();
    const pin = document.getElementById('adminPinInput').value.trim();
    const errorMsg = document.getElementById('loginErrorMsg');
    const submitBtn = document.getElementById('loginSubmitBtn');

    if (errorMsg) errorMsg.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pin })
      });
      const data = await res.json();

      if (data.success && data.token) {
        this.token = data.token;
        sessionStorage.setItem('pearls_admin_token', data.token);
        this.showAuthModal(false);
        await this.refreshData();
      } else {
        if (errorMsg) {
          errorMsg.textContent = data.error || 'Incorrect Manager PIN';
          errorMsg.style.display = 'block';
        }
      }
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Server connection error. Please try again.';
        errorMsg.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  logout() {
    this.token = null;
    sessionStorage.removeItem('pearls_admin_token');
    document.getElementById('adminLoginForm').reset();
    this.showAuthModal(true);
  }

  async refreshData() {
    if (!this.token) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-key': this.token }
      });

      if (res.status === 401) {
        this.logout();
        return;
      }

      const data = await res.json();
      this.orders = data.orders || [];
      this.renderKPIs(data.stats);
      this.renderOrders();
    } catch (err) {
      console.error('Failed to load admin orders', err);
    }
  }

  renderKPIs(stats) {
    if (!stats) return;
    document.getElementById('metricTotalOrders').textContent = stats.totalOrders || 0;
    document.getElementById('metricTotalRevenue').textContent = `GH₵ ${(stats.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('metricPendingOrders').textContent = stats.pendingOrders || 0;
    document.getElementById('metricCompletedOrders').textContent = stats.completedOrders || 0;
  }

  filterStatus(status, el) {
    this.currentFilter = status;
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    this.renderOrders();
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.renderOrders();
  }

  renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    let filtered = [...this.orders];

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(o => o.status === this.currentFilter);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(o => 
        o.trackingCode.toLowerCase().includes(this.searchQuery) ||
        o.customerName.toLowerCase().includes(this.searchQuery) ||
        o.phone.toLowerCase().includes(this.searchQuery) ||
        o.deliveryAddress.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 40px; color: #64748B;">
            No orders found matching the filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const waText = encodeURIComponent(`Hello ${o.customerName}! This is Pearls Gift Collection regarding your order (${o.trackingCode}). Your delivery status is currently: ${o.status}.`);
      const cleanPhone = o.phone.replace(/\D/g, '').replace(/^0/, '233');
      const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

      const itemsHtml = o.items.map(i => `<li>${i.name} (x${i.quantity})${i.selectedColor ? ' [' + i.selectedColor + ']' : ''}</li>`).join('');

      return `
        <tr>
          <td>
            <span class="order-code-badge">${o.trackingCode}</span>
            <div style="font-size: 0.72rem; color: #64748B; margin-top: 4px;">
              ${new Date(o.createdAt).toLocaleDateString()} ${new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </td>
          <td>
            <span class="cust-name">${o.customerName}</span>
            <span class="cust-phone">📞 ${o.phone}</span>
          </td>
          <td>
            <span class="loc-zone">📍 ${o.deliveryZone}</span>
            <span class="loc-addr">${o.deliveryAddress}</span>
          </td>
          <td>
            <ul class="item-list-compact">
              ${itemsHtml}
            </ul>
          </td>
          <td>
            <strong style="color: var(--primary);">GH₵ ${o.grandTotal}</strong>
            <div style="font-size: 0.75rem; color: #64748B;">${o.paymentMethod}</div>
          </td>
          <td>
            <select class="status-select ${o.status.toLowerCase().replace(/\s+/g, '_')}" onchange="admin.updateOrderStatus('${o.id}', this.value)">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn-admin-wa" title="Message customer on WhatsApp">
              💬 Chat
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': this.token
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        await this.refreshData();
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  }
}

const admin = new AdminDashboard();
document.addEventListener('DOMContentLoaded', () => {
  admin.init();
});
