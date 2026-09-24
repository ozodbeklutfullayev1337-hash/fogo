import React, { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, ShoppingBag, User, ShieldAlert, Plus, Minus, Check } from 'lucide-react';
import Admin from './Admin';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Mahsulotlarni backenddan yuklash
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Mahsulotlarni yuklashda xatolik:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const exist = cart.find(x => x.id === product.id);
    if (exist) {
      setCart(cart.map(x => x.id === product.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    const exist = cart.find(x => x.id === product.id);
    if (exist.qty === 1) {
      setCart(cart.filter(x => x.id !== product.id));
    } else {
      setCart(cart.map(x => x.id === product.id ? { ...exist, qty: exist.qty - 1 } : x));
    }
  };

  const totalPrice = cart.reduce((a, c) => a + (c.price || c.newPrice || 0) * c.qty, 0);

  // Buyurtma berish
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Savatchangiz bo\'sh!');

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: '6515742580',
          name: name || 'Mehmon',
          phone: phone || '+998901234567',
          address: address || 'Toshkent shahri',
          items: cart.map(item => ({ productId: item.id, quantity: item.qty }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess(true);
        setCart([]);
        setTimeout(() => {
          setOrderSuccess(false);
          setActiveTab('home');
        }, 2000);
      } else {
        alert('Xatolik: ' + (data.message || 'Buyurtma saqlanmadi'));
      }
    } catch (err) {
      console.error(err);
      alert('Buyurtma berishda xatolik yuz berdi!');
    }
  };

  const categories = ['Barchasi', ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === 'Barchasi' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div style={{ paddingBottom: '75px', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* 1. ASOSIY SAHIFA */}
      {activeTab === 'home' && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Salom, Mehmon! 🍔</h2>
            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>24/7 Ochiq</span>
          </div>

          {/* Banner */}
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff', padding: '18px', borderRadius: '16px', margin: '16px 0', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tezkor yetkazish</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px' }}>Yangi buyurtma berish</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Issiq va mazali fast food taomlari 30 daqiqada siz bilan!</p>
          </div>

          {/* Kategoriyalar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            {categories.map((cat, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedCategory(cat)}
                style={{ 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  border: 'none', 
                  background: selectedCategory === cat ? '#ef4444' : '#e2e8f0', 
                  color: selectedCategory === cat ? '#fff' : '#334155', 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  whiteSpace: 'nowrap', 
                  cursor: 'pointer' 
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '17px', margin: '12px 0 10px 0' }}>Tavsiya etamiz</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {filteredProducts.map((item) => (
              <div key={item.id} style={{ background: '#fff', padding: '10px', borderRadius: '14px', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <img 
                  src={item.image || item.imageUrl} 
                  alt={item.name} 
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px' }} 
                />
                <div>
                  <h4 style={{ margin: '8px 0 2px', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#ef4444', fontSize: '13px' }}>{(item.price || item.newPrice)?.toLocaleString()} so'm</p>
                </div>
                <button 
                  onClick={() => addToCart(item)}
                  style={{ width: '100%', marginTop: '10px', padding: '7px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  + Savatga
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SAVATCHA */}
      {activeTab === 'cart' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 16px 0' }}>Savatcha</h2>
          {orderSuccess && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} /> Buyurtmangiz qabul qilindi va adminga yuborildi!
            </div>
          )}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <p>Savatchangiz bo'sh turibdi</p>
            </div>
          ) : (
            <div>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #edf2f7' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>{item.name}</h4>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{(item.price || item.newPrice)?.toLocaleString()} so'm</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => removeFromCart(item)} style={{ width: '30px', height: '30px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={14} />
                    </button>
                    <b>{item.qty}</b>
                    <button onClick={() => addToCart(item)} style={{ width: '30px', height: '30px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '16px' }}>
                  <b>Jami to'lov:</b>
                  <b style={{ color: '#ef4444' }}>{totalPrice.toLocaleString()} so'm</b>
                </div>
                <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input required placeholder="Ismingiz" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  <input required placeholder="Telefon raqamingiz" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  <input required placeholder="Yetkazish manzili" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  <button type="submit" style={{ marginTop: '6px', padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    Buyurtmani tasdiqlash
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ADMIN BO'LIMI */}
      {activeTab === 'admin' && (
        <Admin />
      )}

      {/* 4. KATALOG */}
      {activeTab === 'catalog' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 16px 0' }}>Barcha taomlar katalogi</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {products.map((item) => (
              <div key={item.id} style={{ background: '#fff', padding: '10px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                <img 
                  src={item.image || item.imageUrl} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} 
                />
                <h4 style={{ margin: '8px 0 2px', fontSize: '14px' }}>{item.name}</h4>
                <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '13px' }}>{(item.price || item.newPrice)?.toLocaleString()} so'm</p>
                <button onClick={() => addToCart(item)} style={{ width: '100%', padding: '6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Savatga</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROFIL */}
      {activeTab === 'profile' && (
        <div style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 16px 0' }}>Mening profilim</h2>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
            <p style={{ margin: '0 0 10px 0' }}><b>Telegram ID:</b> 6515742580</p>
            <p style={{ margin: '0 0 10px 0' }}><b>Xizmat turi:</b> Fast Food Delivery Mini App</p>
            <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Faol hisob</span>
          </div>
        </div>
      )}

      {/* NAVIGATSIYA */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', display: 'flex', justifyContent: 'space-around', padding: '10px 0', borderTop: '1px solid #e2e8f0', zIndex: 1000 }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
          <Home size={20} />
          <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>Asosiy</span>
        </button>

        <button onClick={() => setActiveTab('catalog')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'catalog' ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
          <UtensilsCrossed size={20} />
          <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: activeTab === 'catalog' ? 'bold' : 'normal' }}>Katalog</span>
        </button>

        <button onClick={() => setActiveTab('cart')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'cart' ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
          <ShoppingBag size={20} />
          <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: activeTab === 'cart' ? 'bold' : 'normal' }}>Savat ({cart.reduce((a, c) => a + c.qty, 0)})</span>
        </button>

        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'profile' ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
          <User size={20} />
          <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}>Profil</span>
        </button>

        <button onClick={() => setActiveTab('admin')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'admin' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: 'bold' }}>Admin</span>
        </button>
      </nav>

    </div>
  );
}