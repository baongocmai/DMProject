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
    { id: 1, name: 'Electronics', icon: <FaLaptop />, color: '#4a90e2', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Fashion', icon: <FaTshirt />, color: '#ff6b6b', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Mobile', icon: <FaMobile />, color: '#20bf6b', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Headphones', icon: <FaHeadphones />, color: '#f7b731', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
    { id: 5, name: 'Home', icon: <FaHome />, color: '#9b59b6', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&auto=format&fit=crop&q=60' },
    { id: 6, name: 'Gifts', icon: <FaGift />, color: '#e74c3c', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500&auto=format&fit=crop&q=60' },
    { id: 7, name: 'Books', icon: <FaBook />, color: '#3498db', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=60' },
    { id: 8, name: 'Kids', icon: <FaBabyCarriage />, color: '#1abc9c', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop&q=60' },
    { id: 9, name: 'Sports', icon: <FaFootballBall />, color: '#27ae60', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60' },
    { id: 10, name: 'Kitchen', icon: <FaUtensils />, color: '#e67e22', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60' },
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