import React, { useState, useEffect } from 'react';

const API_BASE = 'https://fogo-8c12.onrender.com';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'add'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Yangi taom qo'shish uchun maydonlar
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Burger');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Buyurtmalarni yuklab olish funksiyasi
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Avval admin yo'lidan tekshiramiz, bo'lmasa oddiy ordersdan
      let res = await fetch(`${API_BASE}/api/admin/orders`);
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/orders`);
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Buyurtmalarni olishda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Iltimos, taom nomi va narxini kiriting!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : null,
          description,
          image
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Taom muvaffaqiyatli qo'shildi!");
        setName('');
        setPrice('');
        setOldPrice('');
        setDescription('');
        setImage('');
      } else {
        alert("Xatolik: taom qo'shilmadi");
      }
    } catch (err) {
      alert("Server bilan bog'lanishda xatolik yuz berdi");
    }
  };

  return (
    <div className="max-w-md mx-auto text-white pb-20">
      {/* Yuqori qism (Header) */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <h1 className="text-base font-bold text-amber-400 flex items-center gap-1.5">
          ⚡ Boshqaruv paneli
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('orders');
              fetchOrders();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-red-500 text-white shadow'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Buyurtmalar ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'add'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            + Taom qo'shish
          </button>
        </div>
      </div>

      {/* Buyurtmalar ro'yxati vkladkasi */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">
              Kelib tushgan buyurtmalar
            </span>
            <button
              onClick={fetchOrders}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1 rounded-md border border-slate-700 transition"
            >
              🔄 Yangilash
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400 text-xs text-center py-8">Yuklanmoqda...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-slate-800">
              Hozircha buyurtmalar mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-700/60">
                    <span className="font-bold text-amber-400 text-sm">
                      Buyurtma #{o.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {o.status || 'kutilmoqda'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <p>
                      <span className="text-slate-500">Mijoz:</span>{' '}
                      <strong className="text-white">{o.customerName || 'Mijoz'}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">Telefon:</span>{' '}
                      <strong className="text-white">{o.phone}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">Manzil:</span> {o.address}
                    </p>

                    {/* Buyurtma tarkibidagi mahsulotlar */}
                    {o.items && o.items.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-700/40 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300 block mb-0.5">Tarkibi:</span>
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>• {item.product?.name || item.name || 'Mahsulot'} x {item.quantity}</span>
                            <span>{Number(item.price * item.quantity).toLocaleString()} so'm</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-750 flex justify-between items-center">
                      <span className="text-slate-400">Jami to'lov:</span>
                      <span className="text-amber-400 font-bold text-sm">
                        {Number(o.totalPrice).toLocaleString()} so'm
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yangi taom qo'shish formasi */}
      {activeTab === 'add' && (
        <form
          onSubmit={handleAddProduct}
          className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3"
        >
          <h2 className="text-sm font-bold text-amber-400 mb-1">Yangi taom qo'shish</h2>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Taom nomi</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Double Cheeseburger"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Kategoriya</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Burger">Burger</option>
                <option value="Lavash">Lavash</option>
                <option value="Hot-dog">Hot-dog</option>
                <option value="Snack">Snack</option>
                <option value="Ichimlik">Ichimlik</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Narxi (so'm)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="35000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Eski narxi (aksiya uchun)</label>
            <input
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              placeholder="40000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Rasm havolasi (URL)</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tavsifi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tarkibi va masalliqlari..."
              rows="2"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition"
          >
            Saqlash
          </button>
        </form>
      )}
    </div>
  );
}