const prisma = require('../database/connection');
const bot = require('../core/bot');

// Mahsulotlar ro'yxatini olish
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    });

    // Frontend uchun narx va rasmlarni moslashtirish
    const formatted = products.map(p => ({
      ...p,
      price: p.newPrice,
      image: p.imageUrl
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Mahsulotlarni olishda xatolik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Buyurtma yaratish
exports.createOrder = async (req, res) => {
  try {
    const { telegramId, name, phone, address, items } = req.body;

    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(telegramId),
          firstName: name || 'Mijoz',
          phone: phone || ''
        }
      });
    }

    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    let totalPrice = 0;
    const orderItemsData = items.map(item => {
      const p = dbProducts.find(prod => prod.id === item.productId);
      const price = p ? p.newPrice : 0;
      totalPrice += price * item.quantity;
      return {
        id: item.productId,
        name: p ? p.name : 'Noma\'lum',
        price: price,
        quantity: item.quantity
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        items: orderItemsData,
        totalPrice: totalPrice,
        location: address || ''
      }
    });

    const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];
    let itemsText = orderItemsData.map(i => `• ${i.name} x ${i.quantity} dona (${i.price * i.quantity} so'm)`).join('\n');

    const adminMessage = 
      `🔔 YANGI BUYURTMA QABUL QILINDI! (#${order.id})\n\n` +
      `👤 Mijoz: ${name || user.firstName}\n` +
      `📞 Telefon: ${phone || user.phone}\n` +
      `📍 Manzil: ${address}\n\n` +
      `📦 Mahsulotlar:\n${itemsText}\n\n` +
      `💰 Jami to'lov: ${totalPrice.toLocaleString()} so'm\n` +
      `⏳ Holati: Kutilmoqda (pending)`;

    for (const aId of adminIds) {
      await bot.telegram.sendMessage(aId.trim(), adminMessage).catch(err => console.log('Adminga bormadi:', err.message));
    }

    res.json({ success: true, data: { ...order, id: order.id } });
  } catch (error) {
    console.error('Buyurtma xatosi:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};