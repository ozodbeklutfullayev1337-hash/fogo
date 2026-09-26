import React, { useState, useEffect } from 'react';

const ADMIN_ID = '6515742580';
// Botingiz tokeni (BotFather bergan token)
const BOT_TOKEN = '8151821814:AAGqZ9pA3aD23k-f_5yYtE5-zD8o9rK1k90';

const DEFAULT_CATEGORIES = [
  { id: 'burgers', name: '🍔 Burger' },
  { id: 'lavash', name: '🌯 Lavash' },
  { id: 'hotdogs', name: '🌭 Hot-dog' },
  { id: 'drinks', name: '🥤 Ichimliklar' }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    categoryId: 'burgers',
    name: 'FOGO Chiq-Burger',
    description: "Yumshoq non, suvli mol go'shti kotleti, maxsus sirli sous, pomidor va karam",
    price: 32000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    categoryId: 'burgers',
    name: 'Double Fire Cheeseburger',
    description: "Ikkita suvli go'sht kotleti, ikki qavat erigan cheddar va achchiq xalapeno",
    price: 45000,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    categoryId: 'lavash',
    name: 'FOGO Tandir Lavash',
    description: "Yupqa qarsildoq xamir, tandir go'shti, pishloq, chips va olovli sous",
    price: 34000,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    categoryId: 'drinks',
    name: 'FOGO Ice Cola (0.5L)',
    description: "Muzdek tetiklashtiruvchi klassik gazlangan ichimlik",
    price: 10000,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80'
  }
];

export default function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('fogo_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form maydonlari
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Admin buyurtmalar tarixi
  const [adminOrders, setAdminOrders] = useState(() => {
    const saved = localStorage.getItem('fogo_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Yangi taom qo'shish maydonlari
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('burgers');
  const [newProdImg, setNewProdImg] = useState('');

  useEffect(() => {
    localStorage.setItem('fogo_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fogo_orders', JSON.stringify(adminOrders));
  }, [adminOrders]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleAddNewProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newP = {
      id: Date.now(),
      categoryId: newProdCategory,
      name: newProdName,
      price: Number(newProdPrice),
      description: "Yangi taom",
      image: newProdImg || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'
    };
    setProducts(prev => [newP, ...prev]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdImg('');
    alert("Yangi taom menyuga muvaffaqiyatli qo'shildi va saqlandi!");
  };

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(item => item.id === product.id);
      if (ex) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const q = item.quantity + delta;
        return q > 0 ? { ...item, quantity: q } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Buyurtmani qabul qilish va Telegram bot orqali to'g'ridan-to'g'ri xabar yuborish
  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = customerName || 'Mijoz';
    const phone = customerPhone || 'Kiritilmadi';
    const address = customerAddress || 'Kiritilmadi';

    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      name,
      phone,
      address,
      items: cart,
      totalPrice: totalAmount,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Admin ro'yxatiga darhol qo'shamiz
    setAdminOrders(prev => [newOrder, ...prev]);

    // 2. Telegram Bot orqali to'g'ridan-to'g'ri profilingizga xabar jo'natish
    const itemsText = cart.map(i => `• ${i.name} x ${i.quantity} dona (${(i.price * i.quantity).toLocaleString()} so'm)`).join('\n');
    const msg = `🔔 <b>YANGI BUYURTMA QABUL QILINDI! (#${newOrder.id})</b>\n\n👤 <b>Mijoz:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n📍 <b>Manzil:</b> ${address}\n\n📦 <b>Mahsulotlar:</b>\n${itemsText}\n\n💰 <b>Jami to'lov:</b> ${totalAmount.toLocaleString()} so'm\n⏳ <b>Holati:</b> Qabul qilindi`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          text: msg,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.log("Xabar yuborish xatosi:", err);
    }

    setCart([]);
    setLoading(false);
    setOrderSuccess(true);
  };

  // Telegram Desktop'da bloklanishni butunlay yechuvchi inline-uslub
  const inputStyle = {
    WebkitUserSelect: 'text',
    userSelect: 'text',
    pointerEvents: 'auto',
    cursor: 'text'
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between pb-28">
      {/* Yuqori qism */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
        <h1 className="text-base font-black text-white">FOGO <span className="text-orange-500">EXPRESS</span></h1>
        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">24/7 ONLINE</span>
      </header>

      {/* Menyu Bo'limi */}
      {activeTab === 'menu' && (
        <main className="px-4 pt-3 flex-1 space-y-3">
          <input
            type="text"
            placeholder="Taom qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={inputStyle}
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white outline-none focus:border-orange-500"
          />

          <div className="grid grid-cols-2 gap-3">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(prod => {
              const qty = cart.find(i => i.id === prod.id)?.quantity || 0;
              return (
                <div key={prod.id} className="bg-zinc-900 rounded-3xl p-3 flex flex-col justify-between border border-white/10">
                  <img src={prod.image} alt={prod.name} className="w-full aspect-square rounded-2xl object-cover mb-2" />
                  <h3 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h3>
                  <p className="text-sm font-black text-amber-400 my-1">{prod.price.toLocaleString()} so'm</p>
                  {qty === 0 ? (
                    <button onClick={() => addToCart(prod)} className="w-full py-2 rounded-xl bg-orange-600 text-xs font-bold active:scale-95 transition-all">+ Qo'shish</button>
                  ) : (
                    <div className="flex justify-between items-center bg-black/40 rounded-xl p-1">
                      <button onClick={() => updateQuantity(prod.id, -1)} className="px-2 font-bold text-zinc-400">-</button>
                      <span className="text-xs font-bold">{qty}</span>
                      <button onClick={() => updateQuantity(prod.id, 1)} className="px-2 font-bold text-orange-400">+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* Savat Bo'limi */}
      {activeTab === 'cart' && (
        <main className="px-4 pt-4 flex-1 space-y-4">
          <h2 className="text-base font-black">🛒 Tanlangan taomlar</h2>
          {cart.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-10">Savat bo'sh</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-900 rounded-2xl p-3 space-y-2 border border-white/10">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-bold text-amber-400">{(item.price * item.quantity).toLocaleString()} so'm</span>
                  </div>
                ))}
              </div>

              {/* Ma'lumot kiritish formasi */}
              <form onSubmit={handleCheckout} className="bg-zinc-900 rounded-3xl p-4 border border-white/10 space-y-3">
                <h3 className="text-xs font-black uppercase text-zinc-300">Yetkazish ma'lumotlari</h3>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  style={inputStyle}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Telefon raqam"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  style={inputStyle}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
                <textarea
                  placeholder="Aniq manzil"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  style={inputStyle}
                  rows="2"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500 resize-none"
                />
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-xs text-zinc-400">Jami:</span>
                  <span className="text-base font-black text-amber-400">{totalAmount.toLocaleString()} so'm</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 font-black text-xs active:scale-95 uppercase tracking-wider"
                >
                  {loading ? "Yuborilmoqda..." : "Buyurtmani yuborish 🚀"}
                </button>
              </form>
            </div>
          )}
        </main>
      )}

      {/* Admin Bo'limi */}
      {activeTab === 'admin' && (
        <main className="px-4 pt-4 flex-1 space-y-4">
          <h2 className="text-base font-black text-cyan-400">⚙️ Admin Boshqaruv Paneli</h2>

          {/* Yangi taom qo'shish */}
          <form onSubmit={handleAddNewProduct} className="bg-zinc-900 rounded-3xl p-4 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase text-orange-400">Yangi taom qo'shish</h3>
            <input
              type="text"
              placeholder="Taom nomi"
              value={newProdName}
              onChange={e => setNewProdName(e.target.value)}
              style={inputStyle}
              required
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <input
              type="number"
              placeholder="Narxi (so'm)"
              value={newProdPrice}
              onChange={e => setNewProdPrice(e.target.value)}
              style={inputStyle}
              required
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-orange-600 text-xs font-bold active:scale-95">Menyuga qo'shish ➕</button>
          </form>

          {/* Tushgan buyurtmalar ro'yxati */}
          <div className="bg-zinc-900 rounded-3xl p-4 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400">Tushgan Buyurtmalar ({adminOrders.length})</h3>
            {adminOrders.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-2">Hozircha buyurtma yo'q</p>
            ) : (
              adminOrders.map(ord => (
                <div key={ord.id} className="bg-black/50 p-3 rounded-2xl border border-white/5 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>#{ord.id} - {ord.name}</span>
                    <span className="text-emerald-400">{ord.date}</span>
                  </div>
                  <p className="text-zinc-400">Tel: {ord.phone} | Manzil: {ord.address}</p>
                  <p className="text-amber-400 font-bold">Jami: {ord.totalPrice.toLocaleString()} so'm</p>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Pastki navigatsiya */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#09090b]/95 border-t border-white/10 px-6 py-2.5 flex justify-between items-center z-50">
        <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center text-xs ${activeTab === 'menu' ? 'text-orange-400 font-bold' : 'text-zinc-500'}`}>
          <span className="text-lg">🍔</span> Menyu
        </button>
        <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center text-xs ${activeTab === 'cart' ? 'text-rose-400 font-bold' : 'text-zinc-500'}`}>
          <span className="text-lg">🛒</span> Savat ({totalCount})
        </button>
        <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center text-xs ${activeTab === 'admin' ? 'text-cyan-400 font-bold' : 'text-zinc-500'}`}>
          <span className="text-lg">⚙️</span> Admin
        </button>
      </nav>

      {/* Buyurtma tasdiqlandi modali */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/15 p-6 rounded-3xl max-w-xs w-full text-center space-y-3">
            <h3 className="text-base font-bold text-white">Buyurtma Qabul Qilindi!</h3>
            <p className="text-xs text-zinc-400">Telegram botingizga bildirishnoma yuborildi.</p>
            <button onClick={() => { setOrderSuccess(false); setActiveTab('menu'); }} className="w-full py-2 bg-orange-600 rounded-xl text-xs font-bold">Tushunarli</button>
          </div>
        </div>
      )}
    </div>
  );
}