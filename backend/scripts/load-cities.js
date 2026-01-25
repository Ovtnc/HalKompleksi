/**
 * Türkiye Şehir ve İlçe Verilerini MongoDB'ye Yükleme Script'i
 * Turkiye API'den şehir ve ilçe verilerini çeker ve veritabanına kaydeder
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Location Schema
const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  districts: [districtSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

citySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Location = mongoose.model('Location', citySchema);

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/halkompleksi';

async function loadCitiesFromAPI() {
  try {
    console.log('📡 Fetching cities from Turkiye API...');
    
    // Fetch data from Turkiye API
    const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.data.length} cities from API`);
    
    return data.data;
  } catch (error) {
    console.error('❌ Error fetching from API:', error);
    throw error;
  }
}

async function saveCitiesToDB(citiesData) {
  try {
    console.log('💾 Saving cities to database...');
    
    let savedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const cityData of citiesData) {
      try {
        // Check if city already exists
        const existingCity = await Location.findOne({ name: cityData.name });
        
        // Prepare districts
        const districts = (cityData.districts || []).map(district => ({
          name: district.name,
          isActive: true,
          createdAt: new Date()
        }));
        
        if (existingCity) {
          // Update existing city
          existingCity.code = cityData.id.toString().padStart(2, '0');
          existingCity.districts = districts;
          existingCity.isActive = true;
          existingCity.updatedAt = new Date();
          await existingCity.save();
          updatedCount++;
          console.log(`🔄 Updated: ${cityData.name} (${districts.length} districts)`);
        } else {
          // Create new city
          const newCity = new Location({
            name: cityData.name,
            code: cityData.id.toString().padStart(2, '0'),
            districts: districts,
            isActive: true
          });
          await newCity.save();
          savedCount++;
          console.log(`✅ Saved: ${cityData.name} (${districts.length} districts)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${cityData.name}:`, error.message);
      }
    }
    
    console.log('\n=================================');
    console.log('📊 Summary:');
    console.log(`  ✅ New cities saved: ${savedCount}`);
    console.log(`  🔄 Cities updated: ${updatedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log('=================================\n');
    
  } catch (error) {
    console.error('❌ Error saving cities to database:', error);
    throw error;
  }
}

async function verifyCities() {
  try {
    const count = await Location.countDocuments({ isActive: true });
    console.log(`✅ Total active cities in database: ${count}`);
    
    // Sample some cities
    const sampleCities = await Location.find({ isActive: true })
      .select('name code districts')
      .limit(5)
      .sort({ name: 1 });
    
    console.log('\n📋 Sample cities:');
    sampleCities.forEach(city => {
      console.log(`  - ${city.name} (Code: ${city.code}, Districts: ${city.districts.length})`);
    });
  } catch (error) {
    console.error('❌ Error verifying cities:', error);
  }
}

async function main() {
  console.log('=================================');
  console.log('🏙️  Türkiye Şehir Verisi Yükleme');
  console.log('=================================\n');
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Fetch cities from API
    const citiesData = await loadCitiesFromAPI();
    
    // Save to database
    await saveCitiesToDB(citiesData);
    
    // Verify
    await verifyCities();
    
    console.log('\n✅ City data loading completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
main();

