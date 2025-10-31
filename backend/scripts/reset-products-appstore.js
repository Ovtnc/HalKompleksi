const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi'
    );
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample products with high-quality images for App Store screenshots
const sampleProducts = [
  {
    title: 'Taze Domates - Organik',
    description: 'Bahçe taze, organik yetiştirilmiş domates. Premium kalite, günlük hasat. Taze ve lezzetli domatesler. İdeal mutfak kullanımı için.',
    price: 25.50,
    currency: 'TL',
    category: 'sebze',
    unit: 'kg',
    stock: 100,
    location: {
      city: 'İstanbul',
      district: 'Beylikdüzü',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592841200221-ad9b3bb49ad9?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['organik', 'taze', 'domates'],
    isApproved: true,
    isAvailable: true,
    isFeatured: true
  },
  {
    title: 'Elma - Kırmızı Premium',
    description: 'Elma, kırmızı, premium kalite. Taze hasat, günlük teslimat. Organik tarım yöntemleriyle yetiştirilmiş.',
    price: 18.90,
    currency: 'TL',
    category: 'meyve',
    unit: 'kg',
    stock: 150,
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['elma', 'meyve', 'taze'],
    isApproved: true,
    isAvailable: true,
    isFeatured: true
  },
  {
    title: 'Nakliye Hizmeti - Kamyon',
    description: 'Profesyonel nakliye hizmeti. Güvenli ve hızlı teslimat. Büyük ve küçük yükler için uygun.',
    price: 1500,
    currency: 'TL',
    category: 'nakliye',
    unit: 'km',
    stock: 1,
    location: {
      city: 'İzmir',
      district: 'Konak',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['nakliye', 'lojistik', 'kamyon'],
    isApproved: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    title: 'Zeytinyağı - Soğuk Sıkım',
    description: 'Premium soğuk sıkım zeytinyağı. Organik, doğal ve lezzetli. Mutfaklarınız için ideal.',
    price: 89.90,
    currency: 'TL',
    category: 'gida',
    unit: 'litre',
    stock: 50,
    location: {
      city: 'Antalya',
      district: 'Muratpaşa',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['zeytinyağı', 'organik', 'gıda'],
    isApproved: true,
    isAvailable: true,
    isFeatured: true
  },
  {
    title: 'Baharat Seti - Karışık',
    description: 'Premium baharat seti. Taze ve kaliteli baharatlar. Mutfak lezzetleriniz için ideal.',
    price: 45.00,
    currency: 'TL',
    category: 'baharat',
    unit: 'paket',
    stock: 75,
    location: {
      city: 'Bursa',
      district: 'Nilüfer',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['baharat', 'set', 'mutfak'],
    isApproved: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    title: 'Ambalaj Kutusu - Karton',
    description: 'Dayanıklı karton ambalaj kutuları. Çeşitli boyutlarda mevcut. Ürünleriniz için ideal.',
    price: 12.50,
    currency: 'TL',
    category: 'ambalaj',
    unit: 'adet',
    stock: 500,
    location: {
      city: 'İstanbul',
      district: 'Kartal',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['ambalaj', 'kutu', 'karton'],
    isApproved: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    title: 'Zirai İlaç - Organik',
    description: 'Organik tarım için uygun zirai ilaç. Güvenli ve etkili. Ürünlerinizi koruyun.',
    price: 125.00,
    currency: 'TL',
    category: 'zirai_ilac',
    unit: 'litre',
    stock: 30,
    location: {
      city: 'Adana',
      district: 'Seyhan',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['zirai', 'ilaç', 'organik'],
    isApproved: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    title: 'Meyve Kasa - Plastik',
    description: 'Dayanıklı plastik meyve kasası. Ürünlerinizi güvenle taşıyın. Çeşitli boyutlarda.',
    price: 35.00,
    currency: 'TL',
    category: 'kasa',
    unit: 'adet',
    stock: 200,
    location: {
      city: 'Gaziantep',
      district: 'Şahinbey',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['kasa', 'plastik', 'ambalaj'],
    isApproved: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    title: 'Yük İndirme Bindirme Hizmeti',
    description: 'Profesyonel yük indirme ve bindirme hizmeti. Deneyimli ekip, güvenli çalışma.',
    price: 500,
    currency: 'TL',
    category: 'indir_bindir',
    unit: 'saat',
    stock: 5,
    location: {
      city: 'İstanbul',
      district: 'Ümraniye',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['yük', 'hizmet', 'lojistik'],
    isApproved: true,
    isAvailable: true,
    isFeatured: false
  },
  {
    title: 'Tarım Arazisi - Satılık',
    description: 'Verimli tarım arazisi. İdeal konum, sulama imkanı mevcut. Yatırım için mükemmel.',
    price: 500000,
    currency: 'TL',
    category: 'emlak',
    unit: 'm²',
    stock: 1,
    location: {
      city: 'Konya',
      district: 'Meram',
      address: 'Hal Kompleksi'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
        isPrimary: true,
        type: 'image'
      }
    ],
    tags: ['emlak', 'arazi', 'tarım'],
    isApproved: true,
    isAvailable: true,
    isFeatured: true
  }
];

async function resetProductsForcefully() {
  try {
    await connectDB();

    // Check existing products first
    const existingProducts = await Product.find({});
    console.log(`\n📊 Mevcut ürün sayısı: ${existingProducts.length}`);
    
    if (existingProducts.length > 0) {
      console.log('\n📦 Mevcut ürünler:');
      existingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - Seller: ${product.seller}`);
      });
    }

    // Find or create a seller user
    let seller = await User.findOne({ userType: 'seller' });
    
    if (!seller) {
      seller = new User({
        name: 'App Store Seller',
        email: 'appstore@example.com',
        password: 'temp123456',
        phone: '05550000000',
        userType: 'seller',
        location: {
          city: 'İstanbul',
          district: 'Beylikdüzü'
        }
      });
      await seller.save();
      console.log('\n✅ Created seller user:', seller._id);
    } else {
      console.log(`\n✅ Using existing seller user: ${seller._id} (${seller.name})`);
    }

    // FORCE DELETE ALL PRODUCTS - no matter who created them
    console.log('\n🗑️  TÜM ÜRÜNLER SİLİNİYOR...');
    const deleteResult = await Product.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} ürün silindi`);

    // Wait a moment to ensure deletion
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new products with seller ID
    console.log('\n➕ 10 yeni ürün oluşturuluyor...');
    const productsToCreate = sampleProducts.map(product => ({
      ...product,
      seller: seller._id,
      approvedAt: new Date(),
      approvedBy: seller._id
    }));

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`✅ ${createdProducts.length} ürün oluşturuldu`);

    // Verify products were created
    const verifyProducts = await Product.find({});
    console.log(`\n✅ Doğrulama: Veritabanında ${verifyProducts.length} ürün var`);

    // Display created products
    console.log('\n📦 Oluşturulan Ürünler:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.category} - ${product.price} ${product.currency} - ${product.isApproved ? '✅ Onaylı' : '⏳ Beklemede'}`);
    });

    console.log('\n✨ App Store products setup completed successfully!');
    console.log('💡 Backend server\'ı yeniden başlatmanız gerekebilir');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
resetProductsForcefully();
