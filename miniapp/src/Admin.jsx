import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders'); // 'orders' | 'new-product'
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Burger',
    imageUrl: ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Buyurtmalarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Holatni o\'zgartirishda xatolik:', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert('Taom muvaffaqiyatli qo\'shildi!');
        setForm({ name: '', description: '', price: '', category: 'Burger', imageUrl: '' });
      }
    } catch (err) {
      console.error('Taom qo\'shishda xatolik:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>⚡ Boshqaruv paneli</h2>
        <div>
          <button 
            onClick={() => setTab('orders')}
            style={{ 
              padding: '8px 14px', 
              marginRight: '8px', 
              background: tab === 'orders' ? '#ef4444' : '#e2e8f0', 
              color: tab === 'orders' ? '#fff' : '#000', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Buyurtmalar ({orders.length})
          </button>
          <button 
            onClick={() => setTab('new-product')}
            style={{ 
              padding: '8px 14px', 
              background: tab === 'new-product' ? '#ef4444' : '#e2e8f0', 
              color: tab === 'new-product' ? '#fff' : '#000', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            + Taom qo'shish
          </button>
        </div>
      </header>

      {tab === 'orders' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>Kelib tushgan buyurtmalar</span>
            <button 
              onClick={fetchOrders} 
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontWeight: 'bold', fontSize: '13px' }}
            >
              <RefreshCw size={14} /> Yangilash
            </button>
          </div>

          {loading ? (
            <p>Yuklanmoqda...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <p>Hozircha buyurtmalar mavjud emas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((o) => (
                <div key={o.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: '0', fontSize: '15px' }}>Buyurtma #{o.id} — {o.totalPrice ? o.totalPrice.toLocaleString() : 0} so'm</h4>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      background: o.status === 'delivered' ? '#dcfce7' : o.status === 'cancelled' ? '#fee2e2' : '#fef9c3', 
                      color: o.status === 'delivered' ? '#166534' : o.status === 'cancelled' ? '#991b1b' : '#854d0e' 
                    }}>
                      {o.status === 'delivered' ? 'Yetkazildi' : o.status === 'cancelled' ? 'Bekor qilindi' : 'Kutilmoqda'}
                    </span>
                  </div>

                  <p style={{ margin: '6px 0 3px', fontSize: '14px' }}>👤 Mijoz: <b>{o.user?.firstName || 'Mehmon'}</b> ({o.user?.phone || 'Raqamsiz'})</p>
                  <p style={{ margin: '3px 0 8px', fontSize: '14px' }}>📍 Manzil: {o.location || 'Ko\'rsatilmagan'}</p>

                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                    <b>Buyurtma tarkibi:</b>
                    <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
                      {Array.isArray(o.items) && o.items.map((item, idx) => (
                        <li key={idx}>{item.name} x {item.quantity} dona ({((item.price || 0) * (item.quantity || 1)).toLocaleString()} so'm)</li>
                      ))}
                    </ul>
                  </div>

                  {/* Buyurtma holatini boshqarish tugmalari */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => updateStatus(o.id, 'delivered')} 
                      style={{ padding: '8px 14px', fontSize: '13px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✅ Yetkazildi
                    </button>
                    <button 
                      onClick={() => updateStatus(o.id, 'cancelled')} 
                      style={{ padding: '8px 14px', fontSize: '13px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ❌ Bekor qilish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateProduct} style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0 }}>Yangi taom qo'shish</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Taom nomi:</label>
            <input 
              required 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              placeholder="Masalan: Double Cheeseburger" 
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Narxi (so'm):</label>
            <input 
              required 
              type="number" 
              value={form.price} 
              onChange={(e) => setForm({ ...form, price: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              placeholder="Masalan: 42000" 
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Kategoriya:</label>
            <input 
              value={form.category} 
              onChange={(e) => setForm({ ...form, category: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              placeholder="Masalan: Burger, Lavash, Ichimlik" 
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Rasm URL havolasi:</label>
            <input 
              value={form.imageUrl} 
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              placeholder="https://..." 
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Tavsif:</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              placeholder="Tarkibi va porsiya haqida ma'lumot" 
            />
          </div>
          <button 
            type="submit" 
            style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Saqlash
          </button>
        </form>
      )}
    </div>
  );
}