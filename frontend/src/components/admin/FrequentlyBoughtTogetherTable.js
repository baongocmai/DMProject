import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Form, Row, Col, Button } from 'react-bootstrap';
import { FaLink, FaShoppingCart, FaInfoCircle } from 'react-icons/fa';
import { formatPrice } from '../../utils/productHelpers';
import './FrequentlyBoughtTogetherTable.css';

const FrequentlyBoughtTogetherTable = ({ data, loading, error }) => {
  const [minSupport, setMinSupport] = useState(0.001);
  const [minItems, setMinItems] = useState(2);
  
  // Debug the data coming in from the API
  useEffect(() => {
    if (data) {
      console.log("FrequentlyBoughtTogether received data:", data);
      
      if (data.frequentItemsets && data.frequentItemsets.length > 0) {
        // Log the first item for debugging
        console.log("First frequentItemset:", data.frequentItemsets[0]);
        console.log("First product:", data.frequentItemsets[0].products[0]);
        
        // Check if we're still getting mock data somehow
        const isMockData = data.frequentItemsets.some(item => 
          item.support > 0.9 || item.count > 10000 || 
          (item.products && item.products.some(p => 
            p.name?.includes('Mock') || p.name?.includes('Mẫu') || 
            p._id?.includes('mock') || p._id?.includes('sample')
          ))
        );
        
        if (isMockData) {
          console.warn('WARNING: Dữ liệu FrequentlyBoughtTogether có vẻ vẫn là dữ liệu mẫu!');
        } else {
          console.log('Đang sử dụng dữ liệu thật từ database');
        }
      }
    }
  }, [data]);

  // Function to filter items based on minSupport and minItems
  const getFilteredPatterns = () => {
    if (!data || !data.frequentItemsets) return [];
    
    // Check if frequentItemsets is not an array
    if (!Array.isArray(data.frequentItemsets)) {
      console.log("Debug - frequentItemsets is not an array:", data.frequentItemsets);
      
      // Log the entire data structure for debugging
      console.log("Debug - Complete data structure:", data);
      
      // Return empty array to prevent errors
      return [];
    }
    
    return data.frequentItemsets
      .filter(pattern => pattern.products.length >= minItems)
      .map(pattern => {
        // Normalize support values for consistent display
        return {
          ...pattern,
          // Ensure support is in decimal format (0-1 range)
          support: pattern.support > 1 ? pattern.support / 100 : pattern.support
        };
      })
      .sort((a, b) => b.support - a.support);
  };

  // Get filtered patterns from real data only
  const filteredPatterns = getFilteredPatterns();

  // Format frequency number
  const formatFrequency = (frequency) => {
    if (!frequency && frequency !== 0) return '0 đơn hàng';
    
    if (frequency >= 1000) {
      // For thousands, show with 1 decimal place - no space between number and K
      return `${(frequency/1000).toFixed(1).replace(/\.0$/, '')}K đơn hàng`;
    }
    
    return `${frequency} đơn hàng`;
  };

  // Format support as percentage
  const formatSupport = (support) => {
    // Check for invalid input
    if (support === undefined || support === null) return '0.0%';
    
    // Always assume support is in decimal format (0-1)
    const percentage = (support * 100).toFixed(1).replace(/\.0$/, '');
    
    // Return the support without space after the number
    return `${percentage}%`;
  };

  // Calculate display width for support bar
  const calculateSupportWidth = (support) => {
    if (support === undefined || support === null) return '0%';
    
    // Always assume support is in decimal format (0-1)
    return `${Math.min(support * 100, 100).toFixed(1).replace(/\.0$/, '')}%`;
  };

  // Determine badge color based on support value
  const getSupportBadgeVariant = (support) => {
    if (support >= 0.2) return 'success';
    if (support >= 0.1) return 'primary';
    if (support >= 0.05) return 'info';
    if (support >= 0.01) return 'warning';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <p className="mb-0">Đã xảy ra lỗi khi tải dữ liệu: {error.message || 'Unknown error'}</p>
      </Alert>
    );
  }

  if (!data || !data.frequentItemsets || data.frequentItemsets.length === 0) {
    return (
      <div>
        <Alert variant="info">
          <FaInfoCircle className="me-2" />
          <span>Không có đủ dữ liệu để phân tích mẫu mua hàng. Cần có ít nhất 2 đơn hàng có sản phẩm chung.</span>
          
          <div className="mt-3">
            <p className="mb-2">Nguyên nhân có thể là:</p>
            <ul>
              <li>Chưa có đủ đơn hàng trong hệ thống</li>
              <li>Các đơn hàng không có sản phẩm chung</li>
              <li>Giá trị minSupport quá cao (thử giảm xuống 0.0001 hoặc thấp hơn)</li>
            </ul>
          </div>
        </Alert>
      </div>
    );
  }

  // Extract the renderDataTable function to avoid code duplication
  function renderDataTable(patterns) {
    return (
      <Card className="frequently-bought-together-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Các sản phẩm thường được mua cùng nhau</h5>
            <small className="text-muted">
              Dựa trên phân tích {data.info ? `${data.info.totalTransactions} đơn hàng` : 'dữ liệu đơn hàng'}
            </small>
          </div>
          <Row className="g-2 align-items-center filter-controls">
            <Col>
              <Form.Group controlId="minSupport" className="mb-0">
                <Form.Label className="small mb-0">Min Support</Form.Label>
                <Form.Select 
                  size="sm"
                  value={minSupport}
                  onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                >
                  <option value="0.01">1%</option>
                  <option value="0.005">0.5%</option>
                  <option value="0.001">0.1%</option>
                  <option value="0.0005">0.05%</option>
                  <option value="0.0001">0.01%</option>
                  <option value="0.00005">0.005%</option>
                  <option value="0.00001">0.001%</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="minItems" className="mb-0">
                <Form.Label className="small mb-0">Min Items</Form.Label>
                <Form.Select
                  size="sm" 
                  value={minItems}
                  onChange={(e) => setMinItems(parseInt(e.target.value))}
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Tần suất mua kèm</th>
                  <th>Tỉ lệ xuất hiện</th>
                  <th>Tổng giá trị</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((pattern, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="product-combination">
                        {pattern.products.map((product, productIdx) => (
                          <div key={product._id} className="product-item-combo">
                            <div className="product-image">
                              {product.image ? (
                                <img 
                                  src={product.image}
                                  alt={product.name} 
                                  onError={(e) => {
                                    console.log("Debug - Image failed to load:", product.image);
                                    e.target.onerror = null; 
                                    
                                    // Thử một số phương pháp dự phòng khác nhau
                                    if (product.image.startsWith('http')) {
                                      // Nếu đã là URL đầy đủ, hiển thị placeholder
                                      e.target.parentNode.innerHTML = `<div class="placeholder-image">${product.name.substring(0, 2).toUpperCase()}</div>`;
                                    } 
                                    else if (product.image.includes('/')) {
                                      // Nếu có dấu / thì có thể là đường dẫn tương đối, thử đường dẫn khác
                                      e.target.src = `/uploads/${product.image.split('/').pop()}`;
                                      e.target.onerror = () => {
                                        e.target.parentNode.innerHTML = `<div class="placeholder-image">${product.name.substring(0, 2).toUpperCase()}</div>`;
                                      };
                                    }
                                    else {
                                      // Thử xem là tên file đơn giản
                                      e.target.src = `/uploads/${product.image}`;
                                      e.target.onerror = () => {
                                        e.target.parentNode.innerHTML = `<div class="placeholder-image">${product.name.substring(0, 2).toUpperCase()}</div>`;
                                      };
                                    }
                                  }}
                                />
                              ) : (
                                <div className="placeholder-image">
                                  {product.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="product-info">
                              <div className="product-name">{product.name}</div>
                              <div className="product-meta">
                                <span className="product-price">{formatPrice(product.price)}</span>
                                <span className="product-category">{product.category}</span>
                              </div>
                            </div>
                            {productIdx < pattern.products.length - 1 && (
                              <div className="link-icon">
                                <FaLink />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getSupportBadgeVariant(pattern.support)} className="frequency-badge">
                        {formatFrequency(pattern.frequency)}
                      </Badge>
                    </td>
                    <td className="support-column">
                      <div className="support-value">{formatSupport(pattern.support)}</div>
                      <div className="support-bar">
                        <div 
                          className="support-fill" 
                          style={{ width: calculateSupportWidth(pattern.support) }} 
                        />
                      </div>
                    </td>
                    <td>
                      {formatPrice(pattern.products.reduce((total, product) => total + product.price, 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            <FaShoppingCart className="me-1" />
            Dữ liệu thực từ cơ sở dữ liệu. Các sản phẩm này thường được khách hàng mua cùng nhau. 
          </small>
        </Card.Footer>
      </Card>
    );
  }

  return renderDataTable(filteredPatterns);
};

export default FrequentlyBoughtTogetherTable; 