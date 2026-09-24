const prisma = require('../database/connection');
const bot = require('../core/bot');

// Получение списка всех заказов
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true
      }
    });

    // Преобразуем BigInt telegramId в строку для корректной сериализации в JSON
    const safeOrders = orders.map(order => ({
      ...order,
      user: order.user ? {
        ...order.user,
        telegramId: order.user.telegramId ? order.user.telegramId.toString() : null
      } : null
    }));

    res.json({ success: true, data: safeOrders });
  } catch (error) {
    console.error('Admin buyurtmalarni olishda xatolik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Обновление статуса заказа
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { user: true }
    });

    if (updatedOrder.user && updatedOrder.user.telegramId) {
      const statusTexts = {
        pending: "⏳ Qabul qilindi / Tayyorlanmoqda",
        delivered: "✅ Yetkazib berildi",
        cancelled: "❌ Bekor qilindi"
      };

      const msg = `Buyurtma #${updatedOrder.id} holati o'zgardi:\n\nYangi holat: ${statusTexts[status] || status}`;
      await bot.telegram.sendMessage(updatedOrder.user.telegramId.toString(), msg).catch(() => {});
    }

    const safeOrder = {
      ...updatedOrder,
      user: updatedOrder.user ? {
        ...updatedOrder.user,
        telegramId: updatedOrder.user.telegramId ? updatedOrder.user.telegramId.toString() : null
      } : null
    };

    res.json({ success: true, data: safeOrder });
  } catch (error) {
    console.error('Status o\'zgartirishda xatolik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Добавление нового блюда
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        newPrice: parseFloat(price),
        oldPrice: parseFloat(price) * 1.1,
        imageUrl: imageUrl || '',
        category: category || 'Burger'
      }
    });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Mahsulot qo\'shishda xatolik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};