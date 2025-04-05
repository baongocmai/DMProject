/**
 * Tiện ích để định dạng các giá trị trong ứng dụng
 */

/**
 * Định dạng giá trị tiền tệ sang định dạng VND
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi đã được định dạng theo tiền tệ VND
 */
export const formatCurrency = (amount: number): string => {
  // Nếu không phải số hợp lệ, trả về 0
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }
  
  // Định dạng theo tiêu chuẩn tiền tệ VND
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0 // Không hiển thị phần thập phân với VND
  }).format(amount);
};

/**
 * Định dạng ngày tháng theo chuẩn Việt Nam
 * @param date Đối tượng ngày hoặc chuỗi ngày cần định dạng
 * @returns Chuỗi ngày đã được định dạng (dd/MM/yyyy)
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  // Định dạng ngày tháng theo chuẩn Việt Nam
  return dateObj.toLocaleDateString('vi-VN');
};

/**
 * Rút gọn văn bản nếu quá dài
 * @param text Văn bản cần rút gọn
 * @param maxLength Độ dài tối đa trước khi rút gọn
 * @returns Văn bản đã được rút gọn (nếu cần)
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Định dạng số lượng (thêm dấu phẩy cho hàng nghìn)
 * @param value Số cần định dạng
 * @returns Chuỗi đã được định dạng với dấu phẩy ngăn cách hàng nghìn
 */
export const formatNumber = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('vi-VN').format(value);
}; 