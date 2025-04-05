const FPGrowth = require("node-fpgrowth");
const { Apriori } = require("apriori");
const NodeCache = require("node-cache");
const Order = require("../models/Order");

// Cache kết quả để tránh tính toán lại mỗi lần gọi API
const cache = new NodeCache({ stdTTL: 600 }); // Cache trong 10 phút

// Lấy danh sách giao dịch từ MongoDB
const getTransactions = async () => {
  const orders = await Order.find({}, "items");
  return orders.map(order => order.items.map(item => item.toString()));
};

// Tự động chọn minSupport dựa vào số lượng giao dịch
const getDynamicMinSupport = (numTransactions) => {
  if (numTransactions < 50) return 0.1; // Dữ liệu ít -> giảm minSupport
  if (numTransactions < 500) return 0.2;
  return 0.3; // Dữ liệu nhiều -> tăng minSupport để giảm noise
};

// Thuật toán Apriori với minSupport động
const getAprioriRecommendations = async () => {
  const cachedData = cache.get("apriori");
  if (cachedData) return cachedData; // Lấy từ cache nếu có

  const transactions = await getTransactions();
  const minSupport = getDynamicMinSupport(transactions.length);
  const apriori = new Apriori({ minSupport });

  return new Promise(resolve => {
    apriori.on("data", result => {
      cache.set("apriori", result.items); // Lưu cache
      resolve(result.items);
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
      const frequentPatterns = results.map(res => res.items);
      cache.set("fp-growth", frequentPatterns);
      resolve(frequentPatterns);
    });
  });
};

module.exports = { getAprioriRecommendations, getFPGrowthRecommendations };
