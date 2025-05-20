import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { 
  FaTshirt, 
  FaMobile, 
  FaLaptop, 
  FaHeadphones, 
  FaHome, 
  FaGift, 
  FaBook, 
  FaBabyCarriage,
  FaFootballBall,
  FaUtensils
} from 'react-icons/fa';

const CategoryList = () => {
  // Enhanced categories with icons and colors
  const categories = [
    { id: 1, name: 'Sữa', icon: <FaLaptop />, color: '#4a90e2', image: 'https://nhabep24h.com/wp-content/uploads/sua-hat-dinh-duong.jpg' },
    { id: 2, name: 'Rau - Củ - Trái cây', icon: <FaTshirt />, color: '#ff6b6b', image: 'https://assets.unileversolutions.com/v1/60221576.png' },
    { id: 3, name: 'Hóa phẩm', icon: <FaMobile />, color: '#20bf6b', image: 'https://hcm.fstorage.vn/images/2023/06/artboard-15-20230608080726.gif' },
    { id: 4, name: 'Chăm Sóc Cá Nhân', icon: <FaHeadphones />, color: '#f7b731', image: 'https://tse2.mm.bing.net/th?id=OIP.v5CPlXASwQf7o_eojPJQpgHaHa&pid=Api&P=0&h=180' },
    { id: 5, name: 'Văn phòng phẩm - Đồ chơi', icon: <FaHome />, color: '#9b59b6', image: 'https://tse1.mm.bing.net/th?id=OIP.5FbVgzH6eQ7OiGqTT8BRkwHaFj&pid=Api&P=0&h=180' },
    { id: 6, name: 'Bánh Kẹo', icon: <FaGift />, color: '#e74c3c', image: 'https://www.dacsanhuongviet.vn/site/wp-content/uploads/2022/12/Banh-keo-ngay-xua-1-1536x1151.jpg' },
    { id: 7, name: 'Đồ uống - Giải khát', icon: <FaBook />, color: '#3498db', image: 'https://tse3.mm.bing.net/th?id=OIP.WPLeUTEXLTybj9PgkZrf5AHaE8&pid=Api&P=0&h=180' },
    { id: 8, name: 'Mì - Thực Phẩm Ăn Liền', icon: <FaBabyCarriage />, color: '#1abc9c', image: 'https://tse3.mm.bing.net/th?id=OIP.9wO_Bv1f9SHYqn7M2m_PZQHaHa&pid=Api&P=0&h=180' },
    { id: 9, name: 'Deal hot', icon: <FaFootballBall />, color: '#27ae60', image: 'https://img.freepik.com/premium-vector/hot-deals-vector-icon-flat-promotion-banner-hot-deal-price-tag-sale-offer-price_567423-966.jpg?w=2000' },
    { id: 10, name: 'Combo', icon: <FaFootballBall />, color: '#27ae60', image: 'https://static.vecteezy.com/system/resources/previews/023/053/406/original/combo-offer-banner-template-megaphone-icon-illustration-flat-design-vector.jpg' },

  ];

  return (
    <div className="category-section py-4">
      <h2 className="section-title mb-4">Danh mục sản phẩm</h2>
      <Row className="g-2">
        {categories.map((category) => (
          <div key={category.id} className="col-5-products">
            <Link 
              to={`/?category=${category.name.toLowerCase()}`} 
              className="category-card"
            >
              <div className="category-image-container">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="category-image" 
                />
                <div className="category-overlay"></div>
                <div 
                  className="category-icon-wrapper" 
                  style={{ backgroundColor: `${category.color}`, color: '#ffffff' }}
                >
                  {category.icon}
                </div>
              </div>
              <p className="category-name">{category.name}</p>
            </Link>
          </div>
        ))}
      </Row>
    </div>
  );
};

export default CategoryList; 