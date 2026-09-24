import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Получение списка продуктов
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });
    return res.json({ success: true, data: products });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({ success: false, message: 'Mahsulotlarni olishda xatolik yuz berdi' });
  }
};

// Создание заказа
export const createOrder = async (req, res) => {
  try {
    const { customerName, phone, address, items, totalPrice, telegramId } = req.body;

    // Безопасное приведение telegramId: если undefined/null, подставляем 0 или null
    const safeTelegramId = telegramId ? BigInt(telegramId) : BigInt(0);

    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName || 'Nomaʼlum mijoz',
        phone: phone || '',
        address: address || '',
        totalPrice: Number(totalPrice) || 0,
        telegramId: safeTelegramId,
        status: 'pending',
        items: {
          create: (items || []).map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity || item.qty || 1,
            price: Number(item.price) || 0
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Преобразуем BigInt в строку перед отправкой в JSON, иначе упадет ошибка JSON.stringify
    const serializedOrder = {
      ...newOrder,
      telegramId: newOrder.telegramId.toString()
    };

    return res.status(201).json({ success: true, data: serializedOrder });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Получение списка заказов (для админки)
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    const serializedOrders = orders.map((order) => ({
      ...order,
      telegramId: order.telegramId ? order.telegramId.toString() : null
    }));

    return res.json({ success: true, data: serializedOrders });
  } catch (error) {
    console.error('getOrders error:', error);
    return res.status(500).json({ success: false, message: 'Buyurtmalarni olishda xatolik yuz berdi' });
  }
};