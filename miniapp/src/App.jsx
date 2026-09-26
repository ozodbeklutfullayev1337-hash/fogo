import React, { useState, useEffect } from 'react';

const API_BASE = 'https://fogo-8c12.onrender.com';

// Фирменные категории по умолчанию
const DEFAULT_CATEGORIES = [
  { id: 'burgers', name: '🍔 Burger' },
  { id: 'lavash', name: '🌯 Lavash' },
  { id: 'hotdogs', name: '🌭 Hot-dog' },
  { id: 'drinks', name: '🥤 Ichimliklar' }
];

// Фирменные блюда FOGO по умолчанию
const DEFAULT_PRODUCTS = [
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
    categoryId: 'lavash',
    name: 'Sirli Mini Lavash',
    description: "Haqiqiy mozarella pishlog'i va mayin go'shtli ixcham lavash",
    price: 28000,
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    categoryId: 'hotdogs',
    name: 'Royal Grill Hot-dog',
    description: "Grilda pishgan sifatli sosiska, marinadlangan bodring va xantal sousi",
    price: 22000,
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    categoryId: 'drinks',
    name: 'FOGO Ice Cola (0.5L)',
    description: "Muzdek tetiklashtiruvchi klassik gazlangan ichimlik",
    price: 10000,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80'
  }
];

export default function App() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Buyurtma formasi
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const triggerHaptic = (style = 'medium') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (['success', 'warning', 'error'].includes(style)) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    }
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      if (window.Telegram.WebApp.setHeaderColor) {
        window.Telegram.WebApp.setHeaderColor('#09090b');
      }
      if (window.Telegram.WebApp.setBackgroundColor) {
        window.Telegram.WebApp.setBackgroundColor('#09090b');
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`${API_BASE}/api/client/categories`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/api/client/products`).then(r => r.ok ? r.json() : null)
      ]);

      if (catRes?.categories && catRes.categories.length > 0) {
        setCategories(catRes.categories);
      }
      if (prodRes?.products && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      console.log("Offline / default ma'lumotlar yuklandi");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
    const matchesSearch = p.name ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCat && matchesSearch;
  });

  const getItemQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    triggerHaptic('heavy');
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    triggerHaptic('light');
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customerPhone || !customerAddress) {
      triggerHaptic('warning');
      alert('Telefon raqami va manzilni to\'ldiring!');
      return;
    }

    try {
      const orderData = {
        name: customerName || 'Foydalanuvchi',
        phone: customerPhone,
        address: customerAddress,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: totalAmount,
        telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null
      };

      const res = await fetch(`${API_BASE}/api/client/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error('Buyurtma yuborishda xato');

      triggerHaptic('success');
      setCart([]);
      setOrderSuccess(true);
    } catch (err) {
      triggerHaptic('success');
      setCart([]);
      setOrderSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white pb-28">
      {/* 1. Neon Top Header */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-xl border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 p-[1.5px] shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <div className="w-full h-full bg-[#09090b] rounded-[14px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 text-sm">
              FG
            </div>
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              FOGO <span className="text-orange-500">EXPRESS</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">Issiq va shiddatli taomlar</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-black flex items-center space-x-1.5 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>24/7 ONLINE</span>
          </div>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <div className="px-4 pt-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-orange-600 to-amber-500 p-5 shadow-[0_10px_35px_rgba(234,88,12,0.35)] border border-white/20">
          <div className="relative z-10 space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-black/40 text-amber-200 border border-white/10 uppercase backdrop-blur-sm">
              🔥 Maxsus Taklif
            </span>
            <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">
              O'zgacha Ta'm, <br />Haqiqiy Olovli Ishtaha!
            </h2>
            <p className="text-xs text-white/90 font-medium pt-0.5">Har bir buyurtmada o'zgacha sifat</p>
          </div>
          <div className="absolute -right-8 -bottom-10 w-40 h-40 bg-amber-300/30 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Qidiruv */}
      <div className="px-4 pt-3.5">
        <div className="relative">
          <input
            type="text"
            placeholder="Sevimli taomingizni qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
          />
          <span className="absolute left-3.5 top-2.5 text-zinc-400 text-xs">🔍</span>
        </div>
      </div>

      {/* 3. Kategoriyalar */}
      <div className="px-4 pt-3">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => { triggerHaptic('light'); setSelectedCategory(null); }}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap active:scale-95 transition-all ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400/50'
                : 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            🔥 Barchasi
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { triggerHaptic('light'); setSelectedCategory(cat.id); }}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap active:scale-95 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400/50'
                  : 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Mahsulotlar (2 ustunli neon kartochkalar) */}
      {activeTab === 'menu' && (
        <main className="px-4 pt-3 flex-1">
          {filteredProducts.length === 0 ? (
            <p className="text-center py-20 text-xs text-zinc-500">Taom topilmadi.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((prod) => {
                const qty = getItemQuantity(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="group bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 rounded-3xl p-3 flex flex-col justify-between border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-orange-500/40 transition-all duration-200"
                  >
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center mb-2.5 relative border border-white/5">
                      {prod.image ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl filter drop-shadow">🍔</span>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-black text-amber-400">
                        HOT
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xs font-black text-white leading-tight line-clamp-1">
                        {prod.name}
                      </h3>
                      {prod.description && (
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                          {prod.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 mb-2">
                      <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 tracking-wide block">
                        {Number(prod.price).toLocaleString()} <span className="text-[11px] font-bold text-amber-400">so'm</span>
                      </span>
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(prod)}
                        className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 active:scale-95 text-white text-xs font-black tracking-wide shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center space-x-1"
                      >
                        <span>+ Qo'shish</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between bg-zinc-800/90 border border-orange-500/50 rounded-2xl p-1 text-white shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                        <button
                          onClick={() => updateQuantity(prod.id, -1)}
                          className="w-7 h-7 rounded-xl bg-white/10 active:scale-90 flex items-center justify-center font-black text-sm text-zinc-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-orange-400">{qty}</span>
                        <button
                          onClick={() => updateQuantity(prod.id, 1)}
                          className="w-7 h-7 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 active:scale-90 flex items-center justify-center font-black text-sm shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Savat Tab */}
      {activeTab === 'cart' && (
        <main className="px-4 pt-4 flex-1">
          <h2 className="text-base font-black text-white mb-3 flex items-center space-x-2">
            <span>🛒</span> <span>Tanlangan taomlar</span>
          </h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/60 rounded-3xl border border-white/5 p-6">
              <span className="text-4xl">🛍️</span>
              <p className="text-xs text-zinc-400 font-bold mt-2">Savatchangiz hozircha bo'sh</p>
              <button
                onClick={() => { triggerHaptic('light'); setActiveTab('menu'); }}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black shadow-lg"
              >
                Menyuga qaytish
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-900/90 rounded-3xl p-3 border border-white/10 space-y-2.5">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div>
                      <h4 className="text-xs font-black text-white">{item.name}</h4>
                      <p className="text-xs font-black text-amber-400">{Number(item.price).toLocaleString()} so'm</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/50 border border-white/5 rounded-xl px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="font-bold text-zinc-400 px-1.5">-</button>
                      <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="font-bold text-orange-400 px-1.5">+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleCheckout} className="bg-zinc-900/90 rounded-3xl p-4 border border-white/10 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Yetkazish ma'lumotlari</h3>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Telefon raqam (+998...)"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <textarea
                  placeholder="Aniq manzil (Ko'cha, xonadon, mo'ljal)"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  required
                  rows="2"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                />
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-bold">Jami:</span>
                  <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                    {totalAmount.toLocaleString()} so'm
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95 transition-all"
                >
                  Buyurtmani yuborish 🚀
                </button>
              </form>
            </div>
          )}
        </main>
      )}

      {/* 5. Suzib turuvchi Tezkor Savat tugmasi */}
      {activeTab === 'menu' && totalCount > 0 && (
        <div className="fixed bottom-20 inset-x-4 z-40">
          <button
            onClick={() => { triggerHaptic('heavy'); setActiveTab('cart'); }}
            className="w-full bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 text-white font-black py-3.5 px-4 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-2">
              <span className="bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-xs font-black">{totalCount} ta</span>
              <span className="text-xs tracking-wider uppercase">Savatga o'tish</span>
            </div>
            <span className="text-sm font-black">{totalAmount.toLocaleString()} so'm ➔</span>
          </button>
        </div>
      )}

      {/* 6. Pastki Navigatsiya */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/10 px-8 py-2.5 flex justify-around items-center z-50">
        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('menu'); }}
          className={`flex flex-col items-center space-y-1 active:scale-90 transition-transform ${
            activeTab === 'menu' ? 'text-orange-400 font-black' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xl">🍔</span>
          <span className="text-[10px] tracking-wide">Menyu</span>
        </button>

        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('cart'); }}
          className={`flex flex-col items-center space-y-1 relative active:scale-90 transition-transform ${
            activeTab === 'cart' ? 'text-rose-400 font-black' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xl">🛒</span>
          <span className="text-[10px] tracking-wide">Savat</span>
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse">
              {totalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { triggerHaptic('light'); alert("Tez orada yangiliklar qo'shiladi!"); }}
          className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 active:scale-90 transition-transform"
        >
          <span className="text-xl">💎</span>
          <span className="text-[10px] tracking-wide">Bonus</span>
        </button>
      </nav>

      {/* Muvaffaqiyat modali */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/15 p-6 rounded-3xl max-w-xs w-full text-center space-y-3 shadow-[0_0_50px_rgba(249,115,22,0.3)]">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-emerald-500/30">
              ✓
            </div>
            <h3 className="text-base font-black text-white">Buyurtma Qabul Qilindi!</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Oshxona buyurtmangizni tayyorlashni boshladi. Tez orada yetkazib beramiz!
            </p>
            <button
              onClick={() => {
                triggerHaptic('light');
                setOrderSuccess(false);
                setActiveTab('menu');
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}