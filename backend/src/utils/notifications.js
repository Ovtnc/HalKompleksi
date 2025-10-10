const Notification = require('../models/Notification');
const ProductRequest = require('../models/ProductRequest');

// Create notification helper
const createNotification = async (userId, type, title, message, productId = null, data = {}) => {
  try {
    console.log(`🔔 Creating notification:`, {
      userId,
      type,
      title,
      message,
      productId,
      data
    });

    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      product: productId,
      data
    });

    await notification.save();
    console.log(`🔔 Notification created for user ${userId}: ${type} with productId: ${productId}`);
    return notification;
  } catch (error) {
    console.error('🔔 Create notification error:', error);
    return null;
  }
};

// Notify seller when product is submitted for approval
const notifyProductPending = async (sellerId, productId, productTitle) => {
  return createNotification(
    sellerId,
    'product_pending',
    'Ürün Onay Sürecinde',
    `"${productTitle}" ürününüz onay için gönderildi. Admin incelemesinden sonra yayınlanacaktır.`,
    productId
  );
};

// Notify seller when product is approved
const notifyProductApproved = async (sellerId, productId, productTitle) => {
  return createNotification(
    sellerId,
    'product_approved',
    'Ürün Onaylandı! 🎉',
    `"${productTitle}" ürününüz onaylandı ve şimdi yayında!`,
    productId
  );
};

// Notify seller when product is rejected
const notifyProductRejected = async (sellerId, productId, productTitle, reason) => {
  return createNotification(
    sellerId,
    'product_rejected',
    'Ürün Reddedildi',
    `"${productTitle}" ürününüz reddedildi. Sebep: ${reason || 'Belirtilmedi'}`,
    productId,
    { rejectionReason: reason }
  );
};

// Notify seller when product is featured
const notifyProductFeatured = async (sellerId, productId, productTitle) => {
  return createNotification(
    sellerId,
    'product_featured',
    'Ürününüz Öne Çıkarıldı! ⭐',
    `"${productTitle}" ürününüz admin tarafından öne çıkarıldı. Ana sayfada görünecek!`,
    productId
  );
};

// Check and notify buyers when matching product is added
const notifyMatchingBuyers = async (product) => {
  try {
    console.log('🔔 [notifyMatchingBuyers] Starting notification check for product:', product.title);
    console.log('🔔 Product category:', product.category);
    console.log('🔔 Product location:', product.location);
    
    // Find active product requests matching this product's category and location
    const requests = await ProductRequest.find({
      category: product.category,
      isActive: true,
      notifiedProducts: { $ne: product._id } // Don't notify twice for same product
    }).populate('user', 'name email');

    console.log(`🔔 Found ${requests.length} matching product requests for category: ${product.category}`);

    let notifiedCount = 0;

    for (const request of requests) {
      console.log(`🔔 Checking request from user: ${request.user?.name || 'Unknown'}`);
      console.log(`🔔 Request keywords:`, request.keywords);
      console.log(`🔔 Request city:`, request.city);
      
      // Check if location matches (if specified)
      if (request.city && product.location && product.location.city) {
        const requestCity = request.city.toLowerCase().trim();
        const productCity = product.location.city.toLowerCase().trim();
        
        if (requestCity !== productCity) {
          console.log(`🔔 ❌ Location mismatch: "${requestCity}" !== "${productCity}"`);
          continue; // Skip if location doesn't match
        }
        console.log(`🔔 ✅ Location match: "${requestCity}"`);
      }

      // Check if keywords match (if specified)
      if (request.keywords && request.keywords.length > 0) {
        const productText = `${product.title} ${product.description}`.toLowerCase();
        console.log(`🔔 Product text for matching:`, productText);
        
        const hasMatch = request.keywords.some(keyword => {
          const match = productText.includes(keyword.toLowerCase());
          console.log(`🔔 Keyword "${keyword}" ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
          return match;
        });
        
        if (!hasMatch) {
          console.log(`🔔 ❌ No keyword match found`);
          continue; // Skip if no keyword match
        }
        console.log(`🔔 ✅ Keywords matched!`);
      }

      // Create notification for buyer
      console.log(`🔔 Creating notification for user: ${request.user._id}`);
      
      // Create a more specific title based on the product
      let notificationTitle = 'Aradığınız Ürün Eklendi! 🎯';
      if (request.keywords && request.keywords.length > 0) {
        const matchedKeyword = request.keywords.find(keyword => 
          product.title.toLowerCase().includes(keyword.toLowerCase()) ||
          product.description.toLowerCase().includes(keyword.toLowerCase())
        );
        if (matchedKeyword) {
          notificationTitle = `"${matchedKeyword}" Ürünü Eklendi! 🎯`;
        }
      }
      
      await createNotification(
        request.user._id,
        'product_available',
        notificationTitle,
        `"${product.title}" - ${product.category} kategorisinde aradığınız ürün eklendi. Talebiniz tamamlandı ve silindi.`,
        product._id,
        { 
          category: product.category,
          city: product.location?.city,
          keywords: request.keywords || [],
          matchedRequestId: request._id,
          productTitle: product.title,
          productPrice: product.price,
          productUnit: product.unit,
          // Add search query for better filtering
          searchQuery: request.keywords ? request.keywords.join(' ') : product.title
        }
      );

      // Delete the matched product request (it's fulfilled!)
      await ProductRequest.findByIdAndDelete(request._id);
      console.log(`🔔 ✅ Product request deleted - fulfilled by product: ${product.title}`);

      notifiedCount++;
      console.log(`🔔 ✅ Notification created and request deleted successfully!`);
    }

    console.log(`🔔 ✅ Notified ${notifiedCount} buyers about new product: ${product.title}`);
    return notifiedCount;
  } catch (error) {
    console.error('🔔 ❌ Notify matching buyers error:', error);
    return 0;
  }
};

module.exports = {
  createNotification,
  notifyProductPending,
  notifyProductApproved,
  notifyProductRejected,
  notifyProductFeatured,
  notifyMatchingBuyers
};

