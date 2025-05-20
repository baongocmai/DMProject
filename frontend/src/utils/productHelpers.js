/**
 * Format price with currency symbol
 * @param {Number} price - Product price
 * @param {String} currency - Currency code (default: VND)
 * @returns {String} Formatted price
 */
export const formatPrice = (price, currency = 'VND') => {
  if (price === undefined || price === null) return '';
  
  // Nhân giá trị với 1000 để hiển thị đúng định dạng tiền tệ
  const priceInVND = price * 1000;
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });
  
  return formatter.format(priceInVND);
};

/**
 * Calculate discount percentage
 * @param {Number} originalPrice - Original price
 * @param {Number} currentPrice - Current price
 * @returns {Number} Discount percentage
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Check if product is in stock
 * @param {Object} product - Product object with stock or countInStock
 * @returns {Boolean} True if product is in stock
 */
export const isInStock = (product) => {
  // Ưu tiên sử dụng trường stock, nếu không có thì dùng countInStock
  const stockValue = 
    product.stock !== undefined ? product.stock : 
    (product.countInStock !== undefined ? product.countInStock : 0);
  
  return stockValue > 0;
};

/**
 * Format product image URL
 * @param {String} image - Product image path
 * @returns {String} Formatted image URL
 */
export const formatImageUrl = (image) => {
  if (!image) return '/images/product-placeholder.png';
  
  // If it's already a full URL, return as is
  if (image.startsWith('http')) {
    return image;
  }
  
  // Check if image is a base64 data URL
  if (image.startsWith('data:image')) {
    return image;
  }
  
  // Otherwise, prepend API URL
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // Remove '/api' from the end to get the base URL
  const baseUrl = apiUrl.includes('/api') 
    ? apiUrl.substring(0, apiUrl.lastIndexOf('/api')) 
    : 'http://localhost:5000';
  
  // Ensure path starts with a slash
  const imagePath = image.startsWith('/') ? image : `/${image}`;
  
  return `${baseUrl}${imagePath}`;
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}; 