import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Barcha buyurtmalarni olish (Admin panel uchun)
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // BigInt qiymatlarini String ga aylantirish (JSON parse xatolik bermasligi uchun)
    const formattedOrders = orders.map((order) => ({
      ...order,
      telegramId: order.telegramId ? order.telegramId.toString() : null
    }));

    return res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('getAdminOrders error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Buyurtmalarni yuklashda xatolik yuz berdi"
    });
  }
};

// Buyurtma holatini yangilash
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        telegramId: updated.telegramId ? updated.telegramId.toString() : null
      }
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Statusni yangilashda xatolik"
    });
  }
};