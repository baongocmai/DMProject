const FPGrowth = require("node-fpgrowth");
const { Apriori } = require("apriori");
const NodeCache = require("node-cache");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Cache kết quả để tránh tính toán lại mỗi lần gọi API
const cache = new NodeCache({ stdTTL: 600 }); // Cache trong 10 phút

// Lấy danh sách giao dịch từ MongoDB
const getTransactions = async () => {
  const orders = await Order.find({}, "items.product");
  return orders.map(order => order.items.map(item => item.product.toString()));
};

// Tự động chọn minSupport dựa vào số lượng giao dịch
const getDynamicMinSupport = (numTransactions) => {
  if (numTransactions < 50) return 0.05; // Dữ liệu ít -> giảm minSupport
  if (numTransactions < 500) return 0.1;
  return 0.2; // Dữ liệu nhiều -> tăng minSupport để giảm noise
};

// Thuật toán Apriori với minSupport động
const getAprioriRecommendations = async () => {
  const cachedData = cache.get("apriori");
  if (cachedData) return cachedData; // Lấy từ cache nếu có

  const transactions = await getTransactions();
  const minSupport = getDynamicMinSupport(transactions.length);
  const minConfidence = 0.3;
  
  const apriori = new Apriori({ minSupport, minConfidence });

  return new Promise(resolve => {
    apriori.on("data", result => {
      const rules = result.itemsets
        .filter(itemset => itemset.items.length > 1)
        .map(itemset => ({
          items: itemset.items,
          support: itemset.support
        }));
      
      cache.set("apriori", rules); // Lưu cache
      resolve(rules);
    });
    
    apriori.exec(transactions);
  });
};

// Thuật toán FP-Growth với minSupport động
const getFPGrowthRecommendations = async () => {
  const cachedData = cache.get("fp-growth");
  if (cachedData) return cachedData;

  const transactions = await getTransactions();
  const minSupport = getDynamicMinSupport(transactions.length);
  const fpgrowth = new FPGrowth.FPGrowth(minSupport);

  return new Promise(resolve => {
    fpgrowth.exec(transactions).then(results => {
      const frequentPatterns = results
        .filter(pattern => pattern.items.length > 1)
        .map(pattern => ({
          items: pattern.items,
          support: pattern.support
        }));
      
      cache.set("fp-growth", frequentPatterns);
      resolve(frequentPatterns);
    });
  });
};

// Lấy đề xuất sản phẩm cho giỏ hàng dựa trên các sản phẩm đang có trong giỏ
const getCartRecommendations = async (cartItems, limit = 4) => {
  try {
    // Lấy IDs của sản phẩm trong giỏ hàng
    const cartProductIds = cartItems.map(item => item.product.toString());
    
    if (cartProductIds.length === 0) {
      // Nếu giỏ hàng trống, trả về sản phẩm nổi bật
      const featuredProducts = await Product.find({ isFeatured: true })
        .limit(limit)
        .select('_id name price images rating numReviews');
      return featuredProducts;
    }
    
    // Lấy luật kết hợp từ thuật toán Apriori
    const rules = await getAprioriRecommendations();
    
    // Tìm các luật có chứa ít nhất một sản phẩm trong giỏ hàng
    const relevantRules = rules.filter(rule => 
      rule.items.some(item => cartProductIds.includes(item))
    );
    
    // Lấy các sản phẩm được đề xuất (loại bỏ các sản phẩm đã có trong giỏ hàng)
    let recommendedProductIds = new Set();
    
    relevantRules.forEach(rule => {
      rule.items.forEach(item => {
        if (!cartProductIds.includes(item)) {
          recommendedProductIds.add(item);
        }
      });
    });
    
    // Chuyển Set thành Array và giới hạn số lượng
    recommendedProductIds = [...recommendedProductIds].slice(0, limit);
    
    // Lấy thông tin chi tiết sản phẩm
    const recommendedProducts = await Product.find({ 
      _id: { $in: recommendedProductIds } 
    }).select('_id name price images rating numReviews');
    
    // Nếu không đủ sản phẩm đề xuất, bổ sung thêm sản phẩm nổi bật
    if (recommendedProducts.length < limit) {
      const additionalCount = limit - recommendedProducts.length;
      const existingIds = recommendedProducts.map(p => p._id.toString());
      
      const additionalProducts = await Product.find({ 
        _id: { $nin: [...cartProductIds, ...existingIds] },
        isFeatured: true
      })
      .limit(additionalCount)
      .select('_id name price images rating numReviews');
      
      return [...recommendedProducts, ...additionalProducts];
    }
    
    return recommendedProducts;
  } catch (error) {
    console.error("Lỗi khi tạo đề xuất giỏ hàng:", error);
    return [];
  }
};

// Lấy đề xuất sản phẩm cho trang chủ
const getHomepageRecommendations = async (userId = null, limit = 8) => {
  try {
    // Nếu có userId, tìm đề xuất cá nhân hóa
    if (userId) {
      // Lấy các sản phẩm mà người dùng đã mua
      const userOrders = await Order.find({ user: userId }, 'items.product');
      const userProducts = userOrders.flatMap(order => 
        order.items.map(item => item.product.toString())
      );
      
      if (userProducts.length > 0) {
        // Lấy các luật kết hợp từ FP-Growth (thường tốt hơn cho đề xuất cá nhân hóa)
        const rules = await getFPGrowthRecommendations();
        
        // Tìm các luật có chứa sản phẩm mà người dùng đã mua
        const relevantRules = rules.filter(rule => 
          rule.items.some(item => userProducts.includes(item))
        );
        
        // Lấy các sản phẩm được đề xuất (loại bỏ các sản phẩm đã mua)
        let recommendedProductIds = new Set();
        
        relevantRules.forEach(rule => {
          rule.items.forEach(item => {
            if (!userProducts.includes(item)) {
              recommendedProductIds.add(item);
            }
          });
        });
        
        // Chuyển Set thành Array và giới hạn số lượng
        recommendedProductIds = [...recommendedProductIds].slice(0, limit);
        
        if (recommendedProductIds.length > 0) {
          // Lấy thông tin chi tiết sản phẩm
          const recommendedProducts = await Product.find({ 
            _id: { $in: recommendedProductIds } 
          }).select('_id name price images rating numReviews description');
          
          // Nếu không đủ sản phẩm đề xuất, bổ sung thêm sản phẩm nổi bật
          if (recommendedProducts.length < limit) {
            const additionalCount = limit - recommendedProducts.length;
            const existingIds = recommendedProducts.map(p => p._id.toString());
            
            const additionalProducts = await Product.find({ 
              _id: { $nin: [...userProducts, ...existingIds] },
              isFeatured: true
            })
            .limit(additionalCount)
            .select('_id name price images rating numReviews description');
            
            return [...recommendedProducts, ...additionalProducts];
          }
          
          return recommendedProducts;
        }
      }
    }
    
    // Nếu không có userId hoặc không có đề xuất cá nhân hóa, trả về sản phẩm nổi bật
    return await Product.find({ isFeatured: true })
      .limit(limit)
      .select('_id name price images rating numReviews description');
  } catch (error) {
    console.error("Lỗi khi tạo đề xuất trang chủ:", error);
    return [];
  }
};

// Lấy các sản phẩm thường được mua cùng nhau cho admin (để tạo combo)
const getFrequentlyBoughtTogether = async (minSupport = 0.05, limit = 20) => {
  try {
    // Sử dụng FP-Growth với minSupport thấp hơn để có nhiều pattern
    const transactions = await getTransactions();
    const fpgrowth = new FPGrowth.FPGrowth(minSupport);
    
    const results = await fpgrowth.exec(transactions);
    
    // Lọc các pattern có từ 2 sản phẩm trở lên và sắp xếp theo support giảm dần
    const frequentPatterns = results
      .filter(pattern => pattern.items.length >= 2)
      .sort((a, b) => b.support - a.support)
      .slice(0, limit);
    
    // Lấy thông tin chi tiết của sản phẩm
    const patternDetails = await Promise.all(
      frequentPatterns.map(async pattern => {
        const products = await Product.find({ 
          _id: { $in: pattern.items } 
        }).select('_id name price images category');
        
        return {
          products,
          support: pattern.support,
          confidence: pattern.confidence || 0,
          frequency: Math.round(pattern.support * transactions.length)
        };
      })
    );
    
    return patternDetails;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm thường mua cùng nhau:", error);
    return [];
  }
};

// Lấy đề xuất sản phẩm liên quan cho trang chi tiết sản phẩm
const getRelatedProductRecommendations = async (productId, limit = 4) => {
  try {
    // Lấy thông tin sản phẩm hiện tại
    const product = await Product.findById(productId);
    if (!product) return [];
    
    // Lấy luật kết hợp từ thuật toán Apriori
    const rules = await getAprioriRecommendations();
    
    // Tìm các luật có chứa sản phẩm hiện tại
    const relevantRules = rules.filter(rule => 
      rule.items.includes(productId)
    );
    
    // Lấy các sản phẩm được đề xuất (loại bỏ sản phẩm hiện tại)
    let recommendedProductIds = new Set();
    
    relevantRules.forEach(rule => {
      rule.items.forEach(item => {
        if (item !== productId) {
          recommendedProductIds.add(item);
        }
      });
    });
    
    // Chuyển Set thành Array và giới hạn số lượng
    recommendedProductIds = [...recommendedProductIds].slice(0, limit);
    
    // Nếu không đủ sản phẩm từ luật kết hợp, tìm thêm sản phẩm cùng danh mục
    if (recommendedProductIds.length < limit) {
      const additionalCount = limit - recommendedProductIds.length;
      
      const similarProducts = await Product.find({ 
        _id: { $ne: productId },
        category: product.category,
        _id: { $nin: recommendedProductIds }
      })
      .limit(additionalCount)
      .select('_id name price images rating numReviews');
      
      const fromRules = await Product.find({ 
        _id: { $in: recommendedProductIds } 
      }).select('_id name price images rating numReviews');
      
      return [...fromRules, ...similarProducts];
    }
    
    // Lấy thông tin chi tiết sản phẩm
    return await Product.find({ 
      _id: { $in: recommendedProductIds } 
    }).select('_id name price images rating numReviews');
  } catch (error) {
    console.error("Lỗi khi tạo đề xuất sản phẩm liên quan:", error);
    return [];
  }
};

module.exports = { 
  getAprioriRecommendations, 
  getFPGrowthRecommendations,
  getCartRecommendations,
  getHomepageRecommendations,
  getFrequentlyBoughtTogether,
  getRelatedProductRecommendations
};
