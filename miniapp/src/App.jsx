import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://fogo-8c12.onrender.com';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'cart' | 'promo' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Checkout ma'lumotlari
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Telegram Haptic
  const triggerHaptic = (type = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (['success', 'warning', 'error'].includes(type)) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      if (window.Telegram.WebApp.setHeaderColor) {
        window.Telegram.WebApp.setHeaderColor('#ffffff');
      }
      if (window.Telegram.WebApp.setBackgroundColor) {
        window.Telegram.WebApp.setBackgroundColor('#f8fafc');
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/api/client/categories`),
        axios.get(`${API_BASE}/api/client/products`)
      ]);
      setCategories(catRes.data.categories || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error("Yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getItemQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    triggerHaptic('medium');
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
      alert('Telefon raqam va manzilni kiriting!');
      return;
    }

    try {
      const orderData = {
        name: customerName || 'Mijoz',
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

      await axios.post(`${API_BASE}/api/client/orders`, orderData);
      triggerHaptic('success');
      setCart([]);
      setOrderSuccess(true);
    } catch (err) {
      triggerHaptic('error');
      alert("Buyurtma yuborishda xatolik yuz berdi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-800 flex flex-col justify-between select-none pb-28">
      {/* 1. Header (EVOS uslubida toza oq, qidiruv va til bilan) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tight text-orange-600">FOGO</span>
          <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">Fast Food</span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => { triggerHaptic('light'); setShowSearch(!showSearch); }}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
          >
            🔍
          </button>
          <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-700">
            <span>🇺🇿</span>
            <span>Uz</span>
          </div>
        </div>
      </header>

      {/* Qidiruv paneli (Ochilganda) */}
      {showSearch && (
        <div className="px-4 pt-3 pb-1 bg-white border-b border-slate-100 animate-item-fade">
          <input
            type="text"
            placeholder="Taom nomini yozing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
        </div>
      )}

      {/* 2. Banner */}
      <div className="px-4 pt-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white shadow-md shadow-orange-500/20">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
            Aksiya va Takliflar
          </span>
          <h2 className="text-base font-black mt-1">Yulduzli kombolar & Chegirmalar!</h2>
          <p className="text-[11px] text-white/90 mt-0.5">30 daqiqa ichida tez va issiq yetkazib beramiz</p>
        </div>
      </div>

      {/* 3. Kategoriyalar (EVOS kabi yumaloq tabletkalar) */}
      <div className="px-4 pt-3">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => { triggerHaptic('light'); setSelectedCategory(null); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
              selectedCategory === null
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-white text-slate-600 border border-slate-200/80 shadow-sm'
            }`}
          >
            Barchasi
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { triggerHaptic('light'); setSelectedCategory(cat.id); }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white text-slate-600 border border-slate-200/80 shadow-sm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Asosiy Mahsulotlar Gridi (Aynan EVOS kabi 2 qatorli grid) */}
      {activeTab === 'menu' && (
        <main className="px-4 pt-3 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Yuklanmoqda...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-20 text-xs text-slate-400">Taomlar topilmadi.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((prod) => {
                const qty = getItemQuantity(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl p-3 flex flex-col justify-between border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative"
                  >
                    {/* Rasm qismi */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center mb-2 relative">
                      {prod.image ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl">🍔</span>
                      )}
                    </div>

                    {/* Nomi va Tavsifi */}
                    <div className="flex-1 flex flex-col justify-start">
                      <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 min-h-[32px]">
                        {prod.name}
                      </h3>
                      {prod.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {prod.description}
                        </p>
                      )}
                    </div>

                    {/* Narxi (EVOS uslubida qalin va ko'zga tashlanadigan) */}
                    <div className="mt-2 mb-2.5">
                      <span className="text-sm font-black text-slate-950 block">
                        {Number(prod.price).toLocaleString()} <span className="text-xs font-bold text-slate-600">so'm</span>
                      </span>
                    </div>

                    {/* Tugma: "Savatchaga" yoki sonini o'zgartirish (- 1 +) */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(prod)}
                        className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-orange-50 active:scale-95 text-slate-800 hover:text-orange-600 text-xs font-black transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Savatchaga</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between bg-orange-500 rounded-2xl p-1 text-white shadow-md shadow-orange-500/20">
                        <button
                          onClick={() => updateQuantity(prod.id, -1)}
                          className="w-7 h-7 rounded-xl bg-white/20 active:scale-90 flex items-center justify-center font-black text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-black">{qty}</span>
                        <button
                          onClick={() => updateQuantity(prod.id, 1)}
                          className="w-7 h-7 rounded-xl bg-white/20 active:scale-90 flex items-center justify-center font-black text-sm"
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
          <h2 className="text-base font-black text-slate-900 mb-3">🛒 Savatchadagi taomlar</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-6">
              <span className="text-4xl">🛍️</span>
              <p className="text-xs text-slate-500 font-bold mt-2">Savatchangiz bo'sh</p>
              <button
                onClick={() => { triggerHaptic('light'); setActiveTab('menu'); }}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-orange-500 text-white text-xs font-black shadow-md shadow-orange-500/20"
              >
                Menyudan tanlash
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-3 border border-slate-100 space-y-2.5 shadow-sm">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{item.name}</h4>
                      <p className="text-xs font-bold text-orange-600">{Number(item.price).toLocaleString()} so'm</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-100 rounded-xl px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="font-bold text-slate-600 px-1.5">-</button>
                      <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="font-bold text-orange-600 px-1.5">+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleCheckout} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase">Yetkazib berish manzili</h3>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Telefon raqam (+998...)"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <textarea
                  placeholder="Aniq manzil (Ko'cha, xonadon, mo'ljal)"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  required
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">Jami summa:</span>
                  <span className="text-base font-black text-slate-950">{totalAmount.toLocaleString()} so'm</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
                >
                  Buyurtmani tasdiqlash 🚀
                </button>
              </form>
            </div>
          )}
        </main>
      )}

      {/* Qalqib chiquvchi Savat Paneli (Floating Bar) */}
      {activeTab === 'menu' && totalCount > 0 && (
        <div className="fixed bottom-20 inset-x-4 z-40">
          <button
            onClick={() => { triggerHaptic('medium'); setActiveTab('cart'); }}
            className="w-full bg-orange-500 active:scale-95 text-white font-black py-3 px-4 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-between transition-transform"
          >
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{totalCount} ta</span>
              <span className="text-xs uppercase tracking-wide">Savatga o'tish</span>
            </div>
            <span className="text-sm">{totalAmount.toLocaleString()} so'm ➔</span>
          </button>
        </div>
      )}

      {/* 5. Pastki Navigatsiya Menyu (Aynan EVOS nusxasi: Menyu | Savat | Aksiyalar | Profil) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-2 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('menu'); }}
          className={`flex flex-col items-center space-y-0.5 active:scale-90 transition-transform ${
            activeTab === 'menu' ? 'text-orange-600 font-black' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px]">Menyu</span>
        </button>

        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('cart'); }}
          className={`flex flex-col items-center space-y-0.5 relative active:scale-90 transition-transform ${
            activeTab === 'cart' ? 'text-orange-600 font-black' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">🛒</span>
          <span className="text-[10px]">Savat</span>
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { triggerHaptic('light'); alert("Tez kunda yangi aksiyalar qo'shiladi!"); }}
          className="flex flex-col items-center space-y-0.5 text-slate-400 font-medium active:scale-90 transition-transform"
        >
          <span className="text-lg">⚡</span>
          <span className="text-[10px]">Aksiyalar</span>
        </button>

        <button
          onClick={() => { triggerHaptic('light'); alert("Admin bilan bog'lanish: @fogo_admin"); }}
          className="flex flex-col items-center space-y-0.5 text-slate-400 font-medium active:scale-90 transition-transform"
        >
          <span className="text-lg">👤</span>
          <span className="text-[10px]">Yana</span>
        </button>
      </nav>

      {/* Muvaffaqiyat modali */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-xs w-full text-center space-y-3 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-black text-slate-900">Buyurtma qabul qilindi!</h3>
            <p className="text-xs text-slate-500">
              Tez orada kuryerimiz siz bilan bog'lanadi. Xaridingiz uchun rahmat!
            </p>
            <button
              onClick={() => {
                triggerHaptic('light');
                setOrderSuccess(false);
                setActiveTab('menu');
              }}
              className="w-full py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 