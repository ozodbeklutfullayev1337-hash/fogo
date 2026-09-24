const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Menyu tozalanmoqda va yangilanmoqda...');

  // Jadvalni tozalash
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    // BURGERLAR
    {
      name: "Non-Burger (Gamburger)",
      description: "Yumshoq non, 100% mol go'shti kotleti, bodring, pomidor va maxsus sous",
      newPrice: 32000,
      oldPrice: 36000,
      category: "Burger",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
    },
    {
      name: "Double Cheeseburger",
      description: "Ikkita suvli go'sht kotleti va ikki qavat erigan cheddar pishlog'i",
      newPrice: 42000,
      oldPrice: 48000,
      category: "Burger",
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500"
    },

    // LAVASH
    {
      name: "Lavash Go'shtli (Katta)",
      description: "Yupqa xamir, mayin mol go'shti, qarsildoq chips, pomidor, bodring, sous",
      newPrice: 38000,
      oldPrice: 42000,
      category: "Lavash",
      imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500"
    },
    {
      name: "Lavash Tovuqli (Pishloqli)",
      description: "Tovuq filesi, erigan sousli pishloq, pomidor va maxsus sous",
      newPrice: 34000,
      oldPrice: 37000,
      category: "Lavash",
      imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500"
    },

    // HOT-DOG
    {
      name: "Mega Hot-Dog",
      description: "Katta sosiska, qarsildoq baget non, xantal, ketchup, tuzlangan bodring",
      newPrice: 26000,
      oldPrice: 30000,
      category: "Hot-dog",
      imageUrl: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=500"
    },
    {
      name: "Hot-Dog Classic",
      description: "Klassik shirin xantal va dudlangan sifatli sosiska",
      newPrice: 18000,
      oldPrice: 22000,
      category: "Hot-dog",
      imageUrl: "https://images.unsplash.com/photo-1627054234594-0131464973dc?w=500"
    },

    // QO'SHIMCHALAR (SNACKS)
    {
      name: "Fri Kartoshka (Katta)",
      description: "Tillarang qarsildoq kartoshka, dengiz tuzi bilan",
      newPrice: 17000,
      oldPrice: 20000,
      category: "Snack",
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500"
    },
    {
      name: "Chicken Nuggets (6 dona)",
      description: "Qarsildoq non talqonida tovuq go'shti bo'laklari va pishloqli sous",
      newPrice: 24000,
      oldPrice: 28000,
      category: "Snack",
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500"
    },

    // ICHIMLIKLAR
    {
      name: "Coca-Cola 0.5L",
      description: "Yaxdek klassik gazlangan ichimlik",
      newPrice: 10000,
      oldPrice: 12000,
      category: "Ichimlik",
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500"
    },
    {
      name: "Fanta 0.5L",
      description: "Apelsinli quyoshli lazzat",
      newPrice: 10000,
      oldPrice: 12000,
      category: "Ichimlik",
      imageUrl: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500"
    },
    {
      name: "Sprite 0.5L",
      description: "Limon va laym ta'mli salqinlantiruvchi ichimlik",
      newPrice: 10000,
      oldPrice: 12000,
      category: "Ichimlik",
      imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500"
    },
    {
      name: "Meva Sharbati (Sok) 1L",
      description: "Tabiiy mevali yaxna sharbat",
      newPrice: 15000,
      oldPrice: 18000,
      category: "Ichimlik",
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500"
    }
  ];

  for (const item of products) {
    await prisma.product.create({ data: item });
  }

  console.log('✅ Yangi toliq menyu rasmlari bilan muvaffaqiyatli yuklandi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });