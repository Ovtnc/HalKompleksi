const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '../src/models/User'));
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

async function updateExistingUsers() {
  try {
    await connectDB();

    // Find all users that are not admin
    const users = await User.find({ userType: { $ne: 'admin' } });
    console.log(`\n📊 Bulunan kullanıcı sayısı: ${users.length}`);

    let updated = 0;
    let skipped = 0;
    for (const user of users) {
      try {
        // Skip users without required fields
        if (!user.userType || !user.phone) {
          console.log(`⏭️  Atlandı (eksik bilgi): ${user.name || user.email}`);
          skipped++;
          continue;
        }

        const needsUpdate = !user.userRoles || 
                           user.userRoles.length === 0 || 
                           !user.userRoles.includes('buyer') || 
                           !user.userRoles.includes('seller');

        if (needsUpdate) {
          // Ensure both buyer and seller roles exist
          const newRoles = [...new Set([...((user.userRoles || [])), 'buyer', 'seller'])];
          
          // Remove admin from roles if accidentally added (only for non-admin users)
          const filteredRoles = newRoles.filter(role => role !== 'admin' || user.userType === 'admin');
          
          // Use updateOne to avoid validation issues
          await User.updateOne(
            { _id: user._id },
            { 
              $set: { 
                userRoles: filteredRoles,
                activeRole: user.activeRole || user.userType
              } 
            }
          );
          
          updated++;
          console.log(`✅ Güncellendi: ${user.name || 'İsimsiz'} (${user.email}) - Roles: ${filteredRoles.join(', ')}`);
        } else {
          console.log(`✓ Zaten güncel: ${user.name || 'İsimsiz'} (${user.email}) - Roles: ${user.userRoles.join(', ')}`);
        }
      } catch (error) {
        console.error(`❌ Hata (${user.name || user.email}):`, error.message);
        skipped++;
      }
    }

    console.log(`\n✨ Toplam ${updated} kullanıcı güncellendi`);
    console.log(`⏭️  Atlandı: ${skipped} kullanıcı`);
    console.log(`📊 Güncelleme gerekmedi: ${users.length - updated - skipped} kullanıcı`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
updateExistingUsers();

