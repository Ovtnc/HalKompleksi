const mongoose = require('mongoose');
const Location = require('../models/Location');
const Category = require('../models/Category');
require('dotenv').config();

// Türkiye'nin tüm illeri ve ilçeleri
const citiesData = [
  {
    name: 'İstanbul',
    districts: ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu']
  },
  {
    name: 'Ankara',
    districts: ['Çankaya', 'Keçiören', 'Mamak', 'Yenimahalle', 'Altındağ', 'Etimesgut', 'Sincan', 'Pursaklar', 'Gölbaşı', 'Kazan', 'Akyurt', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çubuk', 'Elmadağ', 'Evren', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar']
  },
  {
    name: 'İzmir',
    districts: ['Konak', 'Balçova', 'Bayraklı', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karşıyaka', 'Narlıdere', 'Bergama', 'Beydağ', 'Aliağa', 'Çeşme', 'Dikili', 'Foça', 'Karaburun', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Menderes', 'Menemen', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla']
  },
  {
    name: 'Bursa',
    districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Orhaneli', 'Orhangazi', 'Yenişehir']
  },
  {
    name: 'Antalya',
    districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Aksu', 'Döşemealtı', 'Akseki', 'Alanya', 'Demre', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik']
  },
  {
    name: 'Adana',
    districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Tufanbeyli', 'Yumurtalık', 'Feke', 'Aladağ']
  },
  {
    name: 'Konya',
    districts: ['Meram', 'Karatay', 'Selçuklu', 'Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak']
  },
  {
    name: 'Gaziantep',
    districts: ['Şahinbey', 'Şehitkamil', 'Oğuzeli', 'Nizip', 'İslahiye', 'Nurdağı', 'Karkamış', 'Yavuzeli', 'Araban']
  },
  {
    name: 'Mersin',
    districts: ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus']
  },
  {
    name: 'Diyarbakır',
    districts: ['Bağlar', 'Kayapınar', 'Sur', 'Yenişehir', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kocaköy', 'Kulp', 'Lice', 'Silvan']
  }
];

// Kategori verileri
const categoriesData = [
  { name: 'Meyve', icon: 'leaf', color: '#4CAF50', sortOrder: 1 },
  { name: 'Sebze', icon: 'leaf', color: '#8BC34A', sortOrder: 2 },
  { name: 'Tahıl', icon: 'grain', color: '#FF9800', sortOrder: 3 },
  { name: 'Bakliyat', icon: 'seedling', color: '#795548', sortOrder: 4 },
  { name: 'Et & Süt', icon: 'restaurant', color: '#E91E63', sortOrder: 5 },
  { name: 'Baharat', icon: 'flame', color: '#F44336', sortOrder: 6 },
  { name: 'Kuruyemiş', icon: 'tree', color: '#8D6E63', sortOrder: 7 },
  { name: 'Bal', icon: 'flower', color: '#FFC107', sortOrder: 8 },
  { name: 'Zeytin', icon: 'droplet', color: '#4CAF50', sortOrder: 9 },
  { name: 'Organik', icon: 'heart', color: '#9C27B0', sortOrder: 10 }
];

const seedDatabase = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi');
    console.log('📦 MongoDB Connected for seeding');

    // Clear existing data
    await Location.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Existing data cleared');

    // Seed locations
    for (const cityData of citiesData) {
      const location = new Location({
        name: cityData.name,
        districts: cityData.districts.map(districtName => ({
          name: districtName,
          isActive: true
        }))
      });
      await location.save();
    }
    console.log(`🏙️ ${citiesData.length} cities seeded`);

    // Seed categories
    for (const categoryData of categoriesData) {
      const category = new Category(categoryData);
      await category.save();
    }
    console.log(`📂 ${categoriesData.length} categories seeded`);

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

