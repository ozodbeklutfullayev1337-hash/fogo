import React, { useState, useEffect } from 'react';
import Admin from './Admin';

const API_BASE = 'https://fogo-8c12.onrender.com';

// Telegram Haptic Feedback (Telefonda tebranish effekti)
const triggerHaptic = (type = 'light') => {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'cart' | 'admin'
  const [category, setCategory] = useState('Barchasi');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buyurtma formasi
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['Barchasi', 'Burger', 'Lavash', 'Hot-dog', 'Snack', 'Ichimlik'];

  // Taomlarni API dan yuklash
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Taomlarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  // Savatga taom qo'shish
  const addToCart = (product) => {
    triggerHaptic('medium');
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Savatdan bittalab kamaytirish
  const removeFromCart = (productId) => {
    triggerHaptic('light');
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Buyurtmani tasdiqlash
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    try {
      setIsSubmitting(true);
      triggerHaptic('heavy');

      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

      const orderData = {
        customerName: name,
        phone,
        address,
        telegramId: tgUser?.id || null,
        items: cart.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        totalPrice
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await res.json();
      if (result.success) {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        setOrderSuccess(true);
        setCart([]);
        setName('');
        setPhone('');
        setAddress('');
      } else {
        alert(result.message || "Buyurtma yuborishda xatolik bo'ldi");
      }
    } catch (err) {
      alert("Server bilan aloqa uzildi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts =
    category === 'Barchasi'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === category.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 selection:bg-amber-500 selection:text-black">
      {/* 1. Header (Brend logos va ish vaqti) */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center shadow-lg shadow-amber-600/30 font-black text-white text-base">
            F
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              FOGO FAST FOOD
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Tez va issiq yetkazib berish</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          24/7 Ochiq
        </div>
      </header>

      {/* Asosiy kontent bo'limlari */}
      <main className="max-w-md mx-auto px-4 pt-3">
        {activeTab === 'menu' && (
          <>
            {/* 2. Premium Aksiya Banneri */}
            <div className="relative overflow-hidden rounded-2xl p-4 mb-4 bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 shadow-xl shadow-orange-600/20 text-white">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <span className="inline-block bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-amber-200 mb-1.5">
                ⚡ Maxsus Taklif
              </span>
              <h2 className="text-lg font-black leading-tight mb-1">
                Issiq va mazali taomlar 30 daqiqada!
              </h2>
              <p className="text-xs text-white/90">
                Birinchi buyurtmangizga bepul yetkazib berish xizmati.
              </p>
            </div>

            {/* 3. Toifalar Karuseli (Categories Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic('light');
                    setCategory(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    category === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-100'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 4. Taomlar Katalogi */}
            {loading ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-28 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/50"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Bu toifada hozircha taomlar mavjud emas.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map((p) => {
                  const cartItem = cart.find((i) => i.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="group bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-3 flex gap-3 transition-all duration-200 backdrop-blur-sm"
                    >
                      {/* Taom rasmi */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {p.oldPrice && (
                          <span className="absolute top-1 left-1 bg-red-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            AKSIYA
                          </span>
                        )}
                      </div>

                      {/* Ma'lumot qismi */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {p.description || "Suvli kotlet va maxsus FOGO sousi bilan tayyorlangan"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <div className="text-amber-400 font-extrabold text-sm">
                              {Number(p.price).toLocaleString()} <span className="text-[10px] font-medium text-amber-500/80">so'm</span>
                            </div>
                            {p.oldPrice && (
                              <span className="text-[10px] text-slate-500 line-through">
                                {Number(p.oldPrice).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Boshqaruv tugmasi */}
                          {cartItem ? (
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 shadow-inner">
                              <button
                                onClick={() => removeFromCart(p.id)}
                                className="w-6 h-6 rounded-lg bg-slate-800 active:bg-slate-700 flex items-center justify-center font-bold text-white text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-amber-400 w-4 text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(p)}
                                className="w-6 h-6 rounded-lg bg-amber-500 active:bg-amber-400 flex items-center justify-center font-bold text-slate-950 text-xs"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(p)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/10 transition-transform"
                            >
                              <span>+</span> Qo'shish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* 5. Savat va Buyurtma berish oynasi */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-amber-400">Savatchangiz</h2>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
                <div className="text-3xl mb-2">🛒</div>
                <p className="text-xs text-slate-400">Savatchangiz hozircha bo'sh</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Menyuga qaytish
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                        <span className="text-[11px] text-amber-400">
                          {Number(item.price).toLocaleString()} so'm
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buyurtma formasi */}
                <form onSubmit={handleCheckout} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Yetkazib berish ma'lumotlari</h3>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ismingiz</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masalan: Sardor"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Telefon raqam</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Manzil (Ko'cha, xonadon)</label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Chilonzor 9-mavze, 12-uy..."
                      rows="2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Jami to'lov:</span>
                    <span className="text-base font-black text-amber-400">
                      {totalPrice.toLocaleString()} so'm
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-transform"
                  >
                    {isSubmitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* 6. Admin Paneli */}
        {activeTab === 'admin' && <Admin />}
      </main>

      {/* 7. Pastdan Suzuvchi Buyurtma Paneli (Floating Bar - agar savatda taom bo'lsa) */}
      {activeTab === 'menu' && totalItems > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-20 animate-fade-in-up">
          <div
            onClick={() => {
              triggerHaptic('medium');
              setActiveTab('cart');
            }}
            className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-2xl px-4 py-3 shadow-xl shadow-amber-500/20 flex items-center justify-between active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-400 text-xs font-black flex items-center justify-center">
                {totalItems}
              </span>
              <span className="text-xs font-black uppercase tracking-wide">Buyurtma berish</span>
            </div>
            <span className="text-xs font-black">{totalPrice.toLocaleString()} so'm ➔</span>
          </div>
        </div>
      )}

      {/* 8. Pastki Navigatsiya (Bottom Navigation Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-6 py-2.5 flex justify-between items-center z-30">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('menu');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
            activeTab === 'menu' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <span className="text-lg">🍔</span>
          Asosiy
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('cart');
          }}
          className={`relative flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
            activeTab === 'cart' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <span className="text-lg">🛍️</span>
          Savat
          {totalItems > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
              {totalItems}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('admin');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
            activeTab === 'admin' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <span className="text-lg">🛡️</span>
          Admin
        </button>
      </nav>

      {/* Muvaffaqiyatli buyurtma oynasi (Modal) */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-3 animate-scale-up">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-base font-black text-white">Buyurtma qabul qilindi!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tez orada kuryerimiz siz bilan bog'lanadi. Mazali taomlar tayyorlanmoqda!
            </p>
            <button
              onClick={() => {
                triggerHaptic('light');
                setOrderSuccess(false);
                setActiveTab('menu');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}