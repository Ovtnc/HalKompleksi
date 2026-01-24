// Debug utility to get product IDs from the page
// Browser console'da çalıştırmak için

export const getProductIds = () => {
  // Ana sayfadaki ürün kartlarından ID'leri topla
  const productCards = document.querySelectorAll('[data-product-id]');
  const ids: string[] = [];
  
  productCards.forEach((card) => {
    const id = card.getAttribute('data-product-id');
    if (id) ids.push(id);
  });
  
  return ids;
};

// Console'da çalıştırmak için:
// 1. Browser console'u açın (F12)
// 2. Şunu yazın:
//    fetch('https://halkompleksi.com/api/products?limit=10')
//      .then(r => r.json())
//      .then(data => console.table(data.products.map(p => ({ id: p._id, title: p.title }))))



