import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldAlert, Plus, Minus, Trash2 } from 'lucide-react';
import Admin from './Admin.jsx';

const API_BASE = 'https://fogo-8c12.onrender.com';
const ADMIN_ID = '6515742580';

export default function App() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'cart' | 'admin'
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [loading, setLoading] = useState(true);

  // Поля оформления заказа
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Получение данных пользователя Telegram WebApp
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const currentUserId = tgUser?.id ? String(tgUser.id) : '';
  const isOwner = currentUserId === ADMIN_ID;

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    fetch(`${API_BASE}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data || []);
        }
      })
      .catch((err) => console.error('Taomlarni yuklashda xatolik:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Barchasi', 'Burger', 'Lavash', 'Hot-dog', 'Snack', 'Ichimlik'];

  const filteredProducts = selectedCategory === 'Barchasi'
    ? products
    : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Savatingiz bo'sh!");
      return;
    }
    if (!phone || !address) {
      alert('Iltimos, telefon raqamingiz va manzilingizni kiriting!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: tgUser?.id || 0,
          customerName: [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ') || 'Mijoz',
          phone,
          address,
          totalPrice,
          items: cart.map((c) => ({
            productId: c.id,
            quantity: c.qty,
            price: c.price
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Buyurtmangiz muvaffaqiyatli qabul qilindi! Tez orada aloqaga chiqamiz.");
        setCart([]);
        setPhone('');
        setAddress('');
        setActiveTab('menu');
      } else {
        alert("Xatolik: " + (data.message || "Buyurtma saqlanmadi"));
      }
    } catch (err) {
      alert("Server bilan aloqa uzildi. Qaytadan urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 flex flex-col font-sans">
      {/* Шапка */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-amber-500 tracking-wider">FOGO FAST FOOD</h1>
            <p className="text-xs text-slate-400">Tez va mazali yetkazib berish</p>
          </div>
          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            24/7 Ochiq
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 p-4 pb-28 max-w-md mx-auto w-full">
        {activeTab === 'menu' && (
          <div>
            {/* Баннер */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-4 mb-4 text-white shadow-lg">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-black/20 px-2 py-0.5 rounded-full">
                Tezkor yetkazish
              </span>
              <h2 className="text-lg font-bold mt-1">Yangi buyurtma berish</h2>
              <p className="text-xs text-red-100 mt-0.5">Issiq va mazali fast food taomlari 30 daqiqada siz bilan!</p>
            </div>

            {/* Фильтр по категориям */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Список блюд */}
            {loading ? (
              <p className="text-center text-sm text-slate-400 py-12">Taomlar yuklanmoqda...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">Hozircha ushbu bo'limda taomlar mavjud emas.</p>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((p) => {
                  const inCart = cart.find((c) => c.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 flex gap-3 shadow-sm hover:border-slate-600 transition"
                    >
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'}
                        alt={p.name}
                        className="w-24 h-24 rounded-xl object-cover bg-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-100 leading-tight">{p.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/50">
                          <div>
                            <span className="font-extrabold text-sm text-amber-400">
                              {Number(p.price).toLocaleString()} so'm
                            </span>
                            {p.oldPrice && (
                              <span className="text-[10px] text-slate-500 line-through ml-1.5">
                                {Number(p.oldPrice).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
                              <button onClick={() => updateQty(p.id, -1)} className="text-slate-400 hover:text-white">
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-bold text-white px-1">{inCart.qty}</span>
                              <button onClick={() => updateQty(p.id, 1)} className="text-amber-400 hover:text-white">
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(p)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md shadow-amber-500/10 transition"
                            >
                              <Plus size={14} /> Qo'shish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Корзина */}
        {activeTab === 'cart' && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
              <span>Savat</span>
              <span className="text-xs text-slate-400 font-normal">{cart.length} xil taom</span>
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
                <ShoppingBag size={48} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">Savatingiz hozircha bo'sh</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 text-xs font-semibold bg-amber-500 text-slate-950 px-4 py-2 rounded-xl"
                >
                  Menyuga qaytish
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-800 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        <span className="text-xs text-amber-400 font-bold">
                          {(item.price * item.qty).toLocaleString()} so'm
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
                        <button onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-white">
                          {item.qty === 1 ? <Trash2 size={13} className="text-red-400" /> : <Minus size={13} />}
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-amber-400 hover:text-white">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Оформление заказа */}
                <form onSubmit={handleCheckout} className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">Yetkazib berish ma'lumotlari</h3>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Telefon raqam</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Yetkazish manzili</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Chilonzor 9-mavze, 12-uy, 45-xonadon"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
                    <span className="text-slate-400">Jami to'lov:</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {totalPrice.toLocaleString()} so'm
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
                  >
                    {submitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Панель администратора (только для вас) */}
        {activeTab === 'admin' && isOwner && <Admin />}
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md p-2 z-30">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium transition ${
              activeTab === 'menu' ? 'text-amber-500 font-bold' : 'text-slate-400'
            }`}
          >
            <span>🍔 Asosiy</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium relative transition ${
              activeTab === 'cart' ? 'text-amber-500 font-bold' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </div>
            <span className="mt-0.5">Savat</span>
          </button>

          {/* Кнопка админа видна ТОЛЬКО для вашего Telegram ID */}
          {isOwner && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium transition ${
                activeTab === 'admin' ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              <ShieldAlert size={20} />
              <span className="mt-0.5">Admin</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}