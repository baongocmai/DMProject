const FPGrowth = require("node-fpgrowth");
const apriori = require("apriori");
const NodeCache = require("node-cache");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Cache kết quả để tránh tính toán lại mỗi lần gọi API
const cache = new NodeCache({ stdTTL: 600 }); // Cache trong 10 phút

// Lấy danh sách giao dịch từ MongoDB
const getTransactions = async (limit = 0) => {
  try {
    console.log(`Bắt đầu lấy dữ liệu đơn hàng từ database (limit=${limit})...`);
    
    // Lấy đơn hàng từ database
    let orders;
    if (limit > 0) {
      orders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } else {
      orders = await Order.find({}).lean();
    }
    
    console.log(`Đã lấy ${orders.length} đơn hàng từ database`);
    
    // Debug: Log chi tiết về đơn hàng đầu tiên
    if (orders.length > 0) {
      console.log("=== DEBUG: Đơn hàng đầu tiên ===");
      console.log(JSON.stringify(orders[0], null, 2));
      console.log(`Đơn hàng có orderItems? ${orders[0].orderItems ? 'Có' : 'Không'}`);
      if (orders[0].orderItems) {
        console.log(`Số lượng items: ${orders[0].orderItems.length}`);
        console.log("Chi tiết orderItems:");
        orders[0].orderItems.forEach((item, index) => {
          console.log(`Item ${index + 1}:`, {
            product: item.product,
            name: item.name,
            qty: item.qty,
            price: item.price
          });
        });
      }
    }
    
    // Chuyển đổi thành giao dịch
    let transactions = [];
    
    for (const order of orders) {
      // Kiểm tra order.orderItems
      if (order.orderItems && Array.isArray(order.orderItems) && order.orderItems.length > 0) {
        // Log để debug
        console.log(`Đơn hàng ${order._id} có ${order.orderItems.length} sản phẩm`);
        
        // Xử lý cẩn thận productId và thêm sản phẩm theo số lượng
        const productIds = [];
        order.orderItems.forEach(item => {
          if (item && item.product) {
            const productId = typeof item.product === 'object' && item.product._id 
              ? item.product._id.toString() 
              : item.product.toString();
            
            // Thêm sản phẩm vào mảng theo số lượng (qty)
            const qty = item.qty || 1;
            for (let i = 0; i < qty; i++) {
              productIds.push(productId);
            }
            
            console.log(`Product ID: ${productId}, Name: ${item.name}, Qty: ${qty}`);
          }
        });
        
        // Thêm vào danh sách nếu có ít nhất 1 sản phẩm
        if (productIds.length >= 1) {
          transactions.push(productIds);
          console.log(`Đã thêm giao dịch với ${productIds.length} sản phẩm:`, productIds);
        }
      } else {
        console.log(`Đơn hàng ${order._id} không có orderItems hoặc rỗng`);
      }
    }
    
    console.log(`Đã tạo ${transactions.length} giao dịch từ ${orders.length} đơn hàng`);
    
    // Nếu không có giao dịch, thử tạo tập hợp sản phẩm ngẫu nhiên từ database
    if (transactions.length === 0) {
      console.log("QUAN TRỌNG: Không tìm thấy giao dịch nào từ đơn hàng, tạo dữ liệu mẫu từ sản phẩm thực");
      
      // Lấy tất cả sản phẩm từ cơ sở dữ liệu
      const allProducts = await Product.find({}).select('_id name category').lean();
      
      if (allProducts.length === 0) {
        console.log("Không có sản phẩm nào trong database để tạo dữ liệu mẫu");
        return [];
      }
      
      console.log(`Tìm thấy ${allProducts.length} sản phẩm trong database`);
      
      // Lấy ID của tất cả sản phẩm
      const productIds = allProducts.map(product => product._id.toString());
      
      // Tạo 20-50 giao dịch giả lập từ sản phẩm thực
      const sampleTransactions = [];
      const numTransactions = Math.floor(Math.random() * 30) + 20; // 20-50 transactions
      
      for (let i = 0; i < numTransactions; i++) {
        // Mỗi giao dịch chứa 1-5 sản phẩm ngẫu nhiên
        const numProducts = Math.floor(Math.random() * 5) + 1;
        const transaction = [];
        
        // Chọn sản phẩm ngẫu nhiên không trùng lặp
        const shuffled = [...productIds].sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, numProducts);
        
        sampleTransactions.push(selectedProducts);
        console.log(`Tạo giao dịch mẫu ${i + 1} với ${selectedProducts.length} sản phẩm:`, selectedProducts);
      }
      
      console.log(`Đã tạo ${sampleTransactions.length} giao dịch mẫu với sản phẩm thực`);
      return sampleTransactions;
    }
    
    return transactions;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
    // Trả về mảng trống
    return [];
  }
};

// Tự động chọn minSupport dựa vào số lượng giao dịch
const getDynamicMinSupport = (numTransactions) => {
  if (numTransactions < 50) return 0.05; // Dữ liệu ít -> giảm minSupport
  if (numTransactions < 500) return 0.1;
  return 0.2; // Dữ liệu nhiều -> tăng minSupport để giảm noise
};

// Thuật toán Apriori đơn giản hóa để tìm cặp sản phẩm thường mua cùng nhau
const getAprioriRecommendations = async () => {
  const cachedData = cache.get("apriori");
  if (cachedData) return cachedData;

  try {
    const transactions = await getTransactions();
    
    if (!transactions || transactions.length < 2) {
      console.log("Không đủ dữ liệu giao dịch cho Apriori");
      return [];
    }

    // Tính toán minSupport - giảm xuống để có nhiều cặp sản phẩm hơn
    const minSupport = Math.max(1 / transactions.length, 0.01); // Tối thiểu 1 giao dịch hoặc 1%
    const minConfidence = 0.1; // Giảm xuống 10% để có nhiều rules hơn

    console.log(`Chạy Apriori với minSupport=${minSupport}, minConfidence=${minConfidence}`);
    console.log(`Số lượng giao dịch: ${transactions.length}`);

    // Tạo các cặp sản phẩm từ giao dịch
    const pairs = new Map(); // Lưu trữ các cặp sản phẩm và số lần xuất hiện
    const productCount = new Map(); // Lưu trữ số lần xuất hiện của từng sản phẩm

    // Đếm số lần xuất hiện của từng sản phẩm và các cặp sản phẩm
    transactions.forEach(transaction => {
      // Đếm số lần xuất hiện của từng sản phẩm
      transaction.forEach(productId => {
        productCount.set(productId, (productCount.get(productId) || 0) + 1);
      });

      // Tạo các cặp sản phẩm
      for (let i = 0; i < transaction.length; i++) {
        for (let j = i + 1; j < transaction.length; j++) {
          const pair = [transaction[i], transaction[j]].sort().join('_');
          pairs.set(pair, (pairs.get(pair) || 0) + 1);
        }
      }
    });

    // Tạo rules từ các cặp sản phẩm
    const rules = [];
    pairs.forEach((count, pair) => {
      const [product1, product2] = pair.split('_');
      const support = count / transactions.length;

      if (support >= minSupport) {
        // Tính confidence cho cả hai chiều
        const confidence1 = count / productCount.get(product1);
        const confidence2 = count / productCount.get(product2);

        if (confidence1 >= minConfidence) {
          rules.push({
            antecedent: product1,
            consequent: product2,
            support: support,
            confidence: confidence1
          });
        }

        if (confidence2 >= minConfidence) {
          rules.push({
            antecedent: product2,
            consequent: product1,
            support: support,
            confidence: confidence2
          });
        }
      }
    });

    // Sắp xếp rules theo confidence và support
    rules.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return b.support - a.support;
    });

    console.log(`Tìm thấy ${rules.length} luật kết hợp`);
    
    // Log một số rules đầu tiên để kiểm tra
    if (rules.length > 0) {
      console.log("Ví dụ các luật kết hợp:");
      rules.slice(0, 3).forEach((rule, i) => {
        console.log(`Rule ${i + 1}: ${rule.antecedent} -> ${rule.consequent} (conf: ${rule.confidence.toFixed(2)}, sup: ${rule.support.toFixed(2)})`);
      });
    }
    
    cache.set("apriori", rules);
    return rules;
  } catch (error) {
    console.error("Lỗi khi chạy thuật toán Apriori:", error);
    return [];
  }
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
    const cartProductIds = cartItems.map(item => {
      // Đảm bảo lấy được id dù product là object hay string
      if (typeof item.product === 'object' && item.product._id) {
        return item.product._id.toString();
      }
      return item.product.toString();
    }).filter(id => id); // Loại bỏ các ID không hợp lệ
    
    console.log("Cart product IDs:", cartProductIds);
    
    if (cartProductIds.length === 0) {
      // Nếu giỏ hàng trống, trả về sản phẩm nổi bật
      console.log("Giỏ hàng trống, đề xuất sản phẩm nổi bật");
      const featuredProducts = await Product.find({ featured: true })
        .limit(limit)
        .select('_id name price image rating numReviews');
      return featuredProducts;
    }
    
    // Lấy luật kết hợp từ thuật toán Apriori
    const rules = await getAprioriRecommendations();
    console.log(`Đã lấy ${rules.length} luật kết hợp từ Apriori`);
    
    // Tìm các luật có chứa ít nhất một sản phẩm trong giỏ hàng
    const relevantRules = rules.filter(rule => 
      rule.items && rule.items.some(item => cartProductIds.includes(item))
    );
    
    console.log(`Tìm thấy ${relevantRules.length} luật liên quan đến sản phẩm trong giỏ hàng`);
    
    // Lấy các sản phẩm được đề xuất (loại bỏ các sản phẩm đã có trong giỏ hàng)
    let recommendedProductIds = new Set();
    
    relevantRules.forEach(rule => {
      if (rule.items && Array.isArray(rule.items)) {
        rule.items.forEach(item => {
          if (!cartProductIds.includes(item)) {
            recommendedProductIds.add(item);
          }
        });
      }
    });
    
    // Chuyển Set thành Array và giới hạn số lượng
    recommendedProductIds = [...recommendedProductIds].slice(0, limit);
    
    console.log(`Các ID sản phẩm được đề xuất: ${recommendedProductIds.join(', ')}`);
    
    // Nếu không có sản phẩm đề xuất từ luật kết hợp, trả về sản phẩm nổi bật
    if (recommendedProductIds.length === 0) {
      console.log("Không tìm thấy đề xuất từ luật kết hợp, trả về sản phẩm nổi bật");
      const featuredProducts = await Product.find({ 
        featured: true,
        _id: { $nin: cartProductIds }
      })
      .limit(limit)
      .select('_id name price image rating numReviews');
      return featuredProducts;
    }
    
    // Lấy thông tin chi tiết sản phẩm
    const recommendedProducts = await Product.find({ 
      _id: { $in: recommendedProductIds } 
    }).select('_id name price image rating numReviews');
    
    console.log(`Tìm thấy ${recommendedProducts.length} sản phẩm đề xuất`);
    
    // Nếu không đủ sản phẩm đề xuất, bổ sung thêm sản phẩm nổi bật
    if (recommendedProducts.length < limit) {
      const additionalCount = limit - recommendedProducts.length;
      const existingIds = recommendedProducts.map(p => p._id.toString());
      
      console.log(`Bổ sung thêm ${additionalCount} sản phẩm nổi bật`);
      
      const additionalProducts = await Product.find({ 
        _id: { $nin: [...cartProductIds, ...existingIds] },
        featured: true
      })
      .limit(additionalCount)
      .select('_id name price image rating numReviews');
      
      return [...recommendedProducts, ...additionalProducts];
    }
    
    return recommendedProducts;
  } catch (error) {
    console.error("Lỗi khi tạo đề xuất giỏ hàng:", error);
    
    // Nếu lỗi, trả về một số sản phẩm nổi bật
    try {
      console.log("Trả về sản phẩm nổi bật do có lỗi trong quá trình đề xuất");
      const fallbackProducts = await Product.find({ featured: true })
        .limit(limit)
        .select('_id name price image rating numReviews');
      return fallbackProducts;
    } catch (fallbackError) {
      console.error("Lỗi khi lấy sản phẩm nổi bật:", fallbackError);
      return [];
    }
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
const getFrequentlyBoughtTogether = async (minSupport = 0.05, limit = 20, orderLimit = 10000) => {
  try {
    // Tạo key cho cache dựa vào tham số đầu vào
    const cacheKey = `frequently-bought-together-${minSupport}-${limit}-${orderLimit}`;
    
    // Xóa cache để luôn tính toán lại kết quả trong quá trình debug
    cache.del(cacheKey);
    console.log("Đã xóa cache để tính toán lại");
    
    console.log(`Phân tích dữ liệu với minSupport=${minSupport}, limit=${limit}, orderLimit=${orderLimit}`);
    
    // Lấy dữ liệu giao dịch từ database với giới hạn số đơn hàng
    const transactions = await getTransactions(orderLimit);
    
    // Chi tiết debug
    console.log(`DEBUG: Số lượng giao dịch: ${transactions.length}`);
    if (transactions.length > 0) {
      console.log(`DEBUG: Giao dịch đầu tiên:`, JSON.stringify(transactions[0]));
    }
    
    // Chỉ kiểm tra nếu không có giao dịch nào
    if (!transactions || transactions.length === 0) {
      console.log("Không có dữ liệu giao dịch nào");
      return {
        frequentItemsets: [],
        message: "Không có dữ liệu giao dịch nào để phân tích",
        success: false
      };
    }
    
    // Sử dụng minSupport từ tham số nếu nó đủ nhỏ, nếu không sử dụng giá trị nhỏ hơn
    const adjustedMinSupport = Math.min(minSupport, 0.0001);
    
    console.log(`Adjusted minSupport: ${adjustedMinSupport}`);
    
    // Sử dụng FP-Growth với minSupport được điều chỉnh
    const fpgrowth = new FPGrowth.FPGrowth(adjustedMinSupport);
    
    const startTime = Date.now();
    
    console.log("Bắt đầu chạy thuật toán FP-Growth...");
    const results = await fpgrowth.exec(transactions);
    const endTime = Date.now();
    
    console.log(`Phân tích xong trong ${(endTime-startTime)/1000}s. Tìm thấy ${results.length} mẫu.`);
    console.log(`DEBUG: Kết quả đầu tiên:`, results.length > 0 ? JSON.stringify(results[0]) : "Không có kết quả");
    
    // Lọc các pattern có từ 2 sản phẩm trở lên và sắp xếp theo support giảm dần
    const frequentPatterns = results
      .filter(pattern => pattern.items.length >= 2)
      .sort((a, b) => b.support - a.support)
      .slice(0, limit);
    
    console.log(`Đã lọc ${frequentPatterns.length} mẫu phù hợp.`);
    
    // Nếu không có pattern nào, trả về kết quả trống với thông báo rõ ràng
    if (frequentPatterns.length === 0) {
      console.log("Không tìm thấy mẫu mua hàng nào thỏa mãn điều kiện");
      return {
        frequentItemsets: [],
        message: "Không tìm thấy mẫu mua hàng nào thỏa mãn điều kiện. Thử giảm minSupport hoặc thêm dữ liệu.",
        success: false
      };
    }
    
    // Lấy số lượng đơn hàng thực tế để tính tỷ lệ chính xác
    const totalOrders = await Order.countDocuments();
    
    // Lấy thông tin chi tiết của sản phẩm
    const patternDetails = await Promise.all(
      frequentPatterns.map(async pattern => {
        // Lấy thông tin sản phẩm
        const products = await Product.find({ 
          _id: { $in: pattern.items } 
        }).select('_id name price image category');
        
        // Tính số lượng đơn hàng thực tế chứa pattern này
        // Đảm bảo frequency là số nguyên hợp lý và không bị phóng đại
        const frequency = Math.round(pattern.support * transactions.length);
        
        // Tính tỷ lệ xuất hiện thực tế so với tổng số đơn hàng
        // Đảm bảo luôn là số thập phân hợp lý (0-1)
        const actualSupport = Math.min(
          frequency / Math.max(transactions.length, 1),
          1.0 // Đảm bảo không vượt quá 100%
        );
        
        console.log(`Pattern có ${products.length} sản phẩm, frequency = ${frequency}, support = ${actualSupport}`);
        
        return {
          products,
          support: actualSupport, // Tỷ lệ xuất hiện thực tế
          confidence: pattern.confidence || 0,
          frequency: frequency // Số đơn hàng chứa pattern
        };
      })
    );
    
    console.log(`Đã lấy chi tiết cho ${patternDetails.length} mẫu`);
    if (patternDetails.length > 0) {
      console.log(`DEBUG: Mẫu đầu tiên có ${patternDetails[0].products.length} sản phẩm`);
      console.log(`DEBUG: Tỷ lệ xuất hiện: ${patternDetails[0].support}, Tần suất: ${patternDetails[0].frequency} đơn hàng`);
    }
    
    const result = {
      frequentItemsets: patternDetails,
      message: `Danh sách sản phẩm thường được mua cùng nhau (từ ${transactions.length} đơn hàng)`,
      success: true,
      info: {
        totalTransactions: transactions.length,
        totalOrders: totalOrders,
        minSupport: adjustedMinSupport,
        processTime: (endTime-startTime)/1000
      }
    };
    
    // Lưu kết quả vào cache để sử dụng sau
    cache.set(cacheKey, result, 3600); // Cache trong 1 giờ
    
    console.log("Kết quả đã được tính toán và cache");
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm thường mua cùng nhau:", error);
    return {
      frequentItemsets: [],
      message: "Đã xảy ra lỗi khi phân tích dữ liệu: " + error.message,
      success: false,
      error: error.message
    };
  }
};

// Lấy đề xuất sản phẩm liên quan cho trang chi tiết sản phẩm
const getRelatedProductRecommendations = async (productId, limit = 4) => {
  try {
    // Lấy thông tin sản phẩm hiện tại
    const product = await Product.findById(productId);
    if (!product) return [];

    // 1. Lấy sản phẩm từ luật kết hợp Apriori
    const rules = await getAprioriRecommendations();
    let recommendedProducts = [];

    if (rules.length > 0) {
      // Tìm các rules có sản phẩm hiện tại là antecedent
      const relevantRules = rules
        .filter(rule => rule.antecedent === productId)
        .sort((a, b) => b.confidence - a.confidence); // Sắp xếp theo confidence giảm dần

      console.log(`Tìm thấy ${relevantRules.length} luật kết hợp cho sản phẩm ${productId}`);
      
      if (relevantRules.length > 0) {
        // Lấy thông tin chi tiết của các sản phẩm được đề xuất
        const recommendedIds = [...new Set(
          relevantRules.map(rule => rule.consequent)
        )];

        // Lấy thông tin sản phẩm và kết hợp với confidence
        const productsWithConfidence = await Promise.all(
          recommendedIds.map(async (id) => {
            const product = await Product.findOne({ _id: id })
              .select('_id name price images rating numReviews');
            
            // Tìm confidence cao nhất cho sản phẩm này
            const rule = relevantRules.find(r => r.consequent === id);
            return {
              ...product.toObject(),
              confidence: rule ? rule.confidence : 0
            };
          })
        );

        // Sắp xếp theo confidence giảm dần
        recommendedProducts = productsWithConfidence
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, limit);

        console.log('Sản phẩm liên quan theo confidence:');
        recommendedProducts.forEach((p, i) => {
          console.log(`${i + 1}. ${p.name} (confidence: ${p.confidence.toFixed(2)})`);
        });
      }
    }

    // 2. Nếu không đủ sản phẩm từ Apriori, bổ sung từ cùng danh mục
    if (recommendedProducts.length < limit && product.category) {
      const categoryProducts = await Product.find({
        _id: { 
          $ne: productId,
          $nin: recommendedProducts.map(p => p._id)
        },
        category: product.category
      })
      .limit(limit - recommendedProducts.length)
      .select('_id name price images rating numReviews');

      // Thêm confidence = 0 cho các sản phẩm từ cùng danh mục
      const categoryProductsWithConfidence = categoryProducts.map(p => ({
        ...p.toObject(),
        confidence: 0
      }));

      recommendedProducts = [...recommendedProducts, ...categoryProductsWithConfidence];
    }

    // 3. Nếu vẫn không đủ, bổ sung sản phẩm có giá tương tự
    if (recommendedProducts.length < limit) {
      const priceRange = {
        min: product.price * 0.7,
        max: product.price * 1.3
      };

      const similarPriceProducts = await Product.find({
        _id: { 
          $ne: productId,
          $nin: recommendedProducts.map(p => p._id)
        },
        price: { 
          $gte: priceRange.min,
          $lte: priceRange.max
        }
      })
      .limit(limit - recommendedProducts.length)
      .select('_id name price images rating numReviews');

      // Thêm confidence = 0 cho các sản phẩm có giá tương tự
      const similarPriceProductsWithConfidence = similarPriceProducts.map(p => ({
        ...p.toObject(),
        confidence: 0
      }));

      recommendedProducts = [...recommendedProducts, ...similarPriceProductsWithConfidence];
    }

    // Log kết quả cuối cùng
    console.log(`Tổng số sản phẩm liên quan: ${recommendedProducts.length}`);
    console.log('Danh sách sản phẩm liên quan cuối cùng:');
    recommendedProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (confidence: ${p.confidence.toFixed(2)})`);
    });

    console.log('relatedProductsData:', relatedProductsData);
    console.log('relatedProducts:', recommendedProducts);

    return recommendedProducts.slice(0, limit);
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
