// mockApiData.js - Mock data for analytics endpoints

export const mockDashboardStats = {
  totalRevenue: 1250000000,
  totalOrders: 4875,
  totalCustomers: 3215,
  newCustomers: 148,
  totalProducts: 567,
  lowStockProducts: 24,
  pendingOrders: 38
};

export const mockProductAnalytics = {
  topProducts: [
    {
      _id: '1',
      name: 'Smartphone X Pro',
      category: { name: 'Sữa' },
      price: 12000000,
      salePrice: 10500000,
      countInStock: 45,
      totalSales: 215,
      image: 'https://via.placeholder.com/50'
    },
    {
      _id: '2',
      name: 'Wireless Headphones',
      category: { name: 'Audio' },
      price: 2500000,
      salePrice: null,
      countInStock: 78,
      totalSales: 187,
      image: 'https://via.placeholder.com/50'
    },
    {
      _id: '3',
      name: 'Laptop Ultra',
      category: { name: 'Computers' },
      price: 25000000,
      salePrice: 23500000,
      countInStock: 12,
      totalSales: 98,
      image: 'https://via.placeholder.com/50'
    },
    {
      _id: '4',
      name: 'Smart Watch Series 5',
      category: { name: 'Wearables' },
      price: 5000000,
      salePrice: 4200000,
      countInStock: 35,
      totalSales: 145,
      image: 'https://via.placeholder.com/50'
    },
    {
      _id: '5',
      name: '4K Ultra HD TV',
      category: { name: 'Sữa' },
      price: 18000000,
      salePrice: null,
      countInStock: 8,
      totalSales: 76,
      image: 'https://via.placeholder.com/50'
    }
  ],
  salesByCategory: [
    { name: 'Sữa', value: 485000000 },
    { name: 'Computers', value: 320000000 },
    { name: 'Wearables', value: 175000000 },
    { name: 'Audio', value: 145000000 },
    { name: 'Home Appliances', value: 95000000 },
    { name: 'Accessories', value: 65000000 }
  ],
  productViews: [
    { name: 'Smartphone X Pro', views: 4562 },
    { name: 'Laptop Ultra', views: 3241 },
    { name: 'Smart Watch Series 5', views: 2876 },
    { name: 'Wireless Headphones', views: 2654 },
    { name: '4K Ultra HD TV', views: 2145 }
  ]
};

export const mockUserAnalytics = {
  customersByPeriod: [
    { name: 'Jan', newUsers: 120, activeUsers: 350 },
    { name: 'Feb', newUsers: 135, activeUsers: 420 },
    { name: 'Mar', newUsers: 115, activeUsers: 395 },
    { name: 'Apr', newUsers: 160, activeUsers: 450 },
    { name: 'May', newUsers: 185, activeUsers: 580 },
    { name: 'Jun', newUsers: 145, activeUsers: 615 },
    { name: 'Jul', newUsers: 165, activeUsers: 640 },
    { name: 'Aug', newUsers: 140, activeUsers: 620 }
  ],
  usersByDevice: [
    { name: 'Mobile', value: 65 },
    { name: 'Desktop', value: 25 },
    { name: 'Tablet', value: 10 }
  ],
  usersByRegion: [
    { name: 'North', value: 35 },
    { name: 'South', value: 45 },
    { name: 'Central', value: 20 }
  ]
};

export const mockOrderAnalytics = {
  revenueByPeriod: [
    { name: 'Jan', revenue: 85000000, orders: 125, period: 'month' },
    { name: 'Feb', revenue: 92000000, orders: 145, period: 'month' },
    { name: 'Mar', revenue: 115000000, orders: 175, period: 'month' },
    { name: 'Apr', revenue: 108000000, orders: 164, period: 'month' },
    { name: 'May', revenue: 123000000, orders: 183, period: 'month' },
    { name: 'Jun', revenue: 156000000, orders: 212, period: 'month' },
    { name: 'Jul', revenue: 182000000, orders: 245, period: 'month' },
    { name: 'Aug', revenue: 145000000, orders: 198, period: 'month' }
  ],
  recentOrders: [
    {
      _id: '60d4a3b2c7f2a234567890a1',
      orderNumber: 'ORD-12345',
      user: { name: 'Nguyễn Văn An', email: 'an@example.com' },
      totalPrice: 3250000,
      status: 'delivered',
      isPaid: true,
      createdAt: '2023-08-15T08:30:00Z'
    },
    {
      _id: '60d4a3b2c7f2a234567890a2',
      orderNumber: 'ORD-12346',
      user: { name: 'Trần Thị Bình', email: 'binh@example.com' },
      totalPrice: 1850000,
      status: 'processing',
      isPaid: true,
      createdAt: '2023-08-15T10:20:00Z'
    },
    {
      _id: '60d4a3b2c7f2a234567890a3',
      orderNumber: 'ORD-12347',
      user: { name: 'Lê Văn Cường', email: 'cuong@example.com' },
      totalPrice: 5450000,
      status: 'shipped',
      isPaid: true,
      createdAt: '2023-08-14T15:45:00Z'
    },
    {
      _id: '60d4a3b2c7f2a234567890a4',
      orderNumber: 'ORD-12348',
      user: { name: 'Phạm Thị Dung', email: 'dung@example.com' },
      totalPrice: 1250000,
      status: 'pending',
      isPaid: false,
      createdAt: '2023-08-14T16:30:00Z'
    },
    {
      _id: '60d4a3b2c7f2a234567890a5',
      orderNumber: 'ORD-12349',
      user: { name: 'Hoàng Văn Eo', email: 'eo@example.com' },
      totalPrice: 3750000,
      status: 'cancelled',
      isPaid: false,
      createdAt: '2023-08-13T09:15:00Z'
    }
  ],
  ordersByPaymentMethod: [
    { name: 'Credit Card', value: 45 },
    { name: 'Bank Transfer', value: 25 },
    { name: 'COD', value: 20 },
    { name: 'E-wallet', value: 10 }
  ]
};

// Mock data for categories
export const mockCategories = [
  {
    _id: '1',
    name: 'Sữa',
    slug: 'Sữa',
    description: 'Electronic devices and accessories',
    image: 'https://via.placeholder.com/100',
    parent: null,
    isActive: true,
    productsCount: 125,
    createdAt: '2023-01-15T08:30:00Z'
  },
  {
    _id: '2',
    name: 'Computers',
    slug: 'computers',
    description: 'Laptops, desktops, and computing accessories',
    image: 'https://via.placeholder.com/100',
    parent: '1',
    isActive: true,
    productsCount: 48,
    createdAt: '2023-01-20T10:20:00Z'
  },
  {
    _id: '3',
    name: 'Mobile Phones',
    slug: 'mobile-phones',
    description: 'Smartphones and accessories',
    image: 'https://via.placeholder.com/100',
    parent: '1',
    isActive: true,
    productsCount: 73,
    createdAt: '2023-01-25T09:15:00Z'
  },
  {
    _id: '4',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Rau - củ - quả and apparel',
    image: 'https://via.placeholder.com/100',
    parent: null,
    isActive: true,
    productsCount: 210,
    createdAt: '2023-02-05T11:30:00Z'
  },
  {
    _id: '5',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Home appliances and kitchen essentials',
    image: 'https://via.placeholder.com/100',
    parent: null,
    isActive: true,
    productsCount: 156,
    createdAt: '2023-02-10T13:45:00Z'
  }
];

// Mock data for attributes
export const mockAttributes = [
  {
    _id: '1',
    name: 'Color',
    description: 'Product color variations',
    isActive: true,
    values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'],
    createdAt: '2023-01-10T08:30:00Z'
  },
  {
    _id: '2',
    name: 'Size',
    description: 'Product size variations',
    isActive: true,
    values: ['S', 'M', 'L', 'XL', 'XXL'],
    createdAt: '2023-01-12T10:15:00Z'
  },
  {
    _id: '3',
    name: 'Material',
    description: 'Product material types',
    isActive: true,
    values: ['Cotton', 'Polyester', 'Leather', 'Nylon', 'Wool'],
    createdAt: '2023-01-15T09:45:00Z'
  },
  {
    _id: '4',
    name: 'Storage',
    description: 'Device storage capacity',
    isActive: true,
    values: ['64GB', '128GB', '256GB', '512GB', '1TB'],
    createdAt: '2023-01-20T11:30:00Z'
  },
  {
    _id: '5',
    name: 'RAM',
    description: 'Device memory capacity',
    isActive: true,
    values: ['4GB', '8GB', '16GB', '32GB', '64GB'],
    createdAt: '2023-01-25T14:20:00Z'
  }
];

// Mock data for pending orders
export const mockPendingOrders = [
  {
    _id: '1',
    orderNumber: 'ORD-12348',
    user: { _id: '101', name: 'Phạm Thị Dung', email: 'dung@example.com' },
    items: [
      { product: { name: 'Smartphone X Pro', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 10500000 },
      { product: { name: 'Wireless Headphones', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 2500000 }
    ],
    totalPrice: 13000000,
    shippingAddress: {
      address: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      postalCode: '70000',
      country: 'Vietnam'
    },
    paymentMethod: 'COD',
    isPaid: false,
    status: 'pending',
    createdAt: '2023-08-14T16:30:00Z'
  },
  {
    _id: '2',
    orderNumber: 'ORD-12351',
    user: { _id: '102', name: 'Vũ Minh Hiếu', email: 'hieu@example.com' },
    items: [
      { product: { name: 'Laptop Ultra', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 23500000 }
    ],
    totalPrice: 23500000,
    shippingAddress: {
      address: '45 Lê Lợi',
      city: 'Hà Nội',
      postalCode: '10000',
      country: 'Vietnam'
    },
    paymentMethod: 'Bank Transfer',
    isPaid: true,
    status: 'pending',
    createdAt: '2023-08-15T09:45:00Z'
  },
  {
    _id: '3',
    orderNumber: 'ORD-12353',
    user: { _id: '103', name: 'Đỗ Thành Nam', email: 'nam@example.com' },
    items: [
      { product: { name: '4K Ultra HD TV', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 18000000 },
      { product: { name: 'Smart Watch Series 5', image: 'https://via.placeholder.com/50' }, quantity: 2, price: 8400000 }
    ],
    totalPrice: 26400000,
    shippingAddress: {
      address: '78 Trần Hưng Đạo',
      city: 'Đà Nẵng',
      postalCode: '50000',
      country: 'Vietnam'
    },
    paymentMethod: 'Credit Card',
    isPaid: true,
    status: 'pending',
    createdAt: '2023-08-15T10:15:00Z'
  }
];

// Mock data for processing orders
export const mockProcessingOrders = [
  {
    _id: '4',
    orderNumber: 'ORD-12346',
    user: { _id: '104', name: 'Trần Thị Bình', email: 'binh@example.com' },
    items: [
      { product: { name: 'Wireless Headphones', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 2500000 },
      { product: { name: 'Smart Watch Series 5', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 4200000 }
    ],
    totalPrice: 6700000,
    shippingAddress: {
      address: '56 Bà Triệu',
      city: 'Hà Nội',
      postalCode: '10000',
      country: 'Vietnam'
    },
    paymentMethod: 'E-wallet',
    isPaid: true,
    status: 'processing',
    createdAt: '2023-08-15T10:20:00Z'
  },
  {
    _id: '5',
    orderNumber: 'ORD-12350',
    user: { _id: '105', name: 'Nguyễn Minh Tuấn', email: 'tuan@example.com' },
    items: [
      { product: { name: 'Laptop Ultra', image: 'https://via.placeholder.com/50' }, quantity: 1, price: 23500000 }
    ],
    totalPrice: 23500000,
    shippingAddress: {
      address: '101 Lý Thường Kiệt',
      city: 'Hồ Chí Minh',
      postalCode: '70000',
      country: 'Vietnam'
    },
    paymentMethod: 'Bank Transfer',
    isPaid: true,
    status: 'processing',
    createdAt: '2023-08-14T08:30:00Z'
  }
];

// Mock data for customers
export const mockCustomers = [
  {
    _id: '101',
    name: 'Phạm Thị Dung',
    email: 'dung@example.com',
    phone: '0901234567',
    group: { _id: '1', name: 'Regular' },
    totalOrders: 5,
    totalSpent: 15250000,
    createdAt: '2022-05-10T08:30:00Z',
    lastOrderDate: '2023-08-14T16:30:00Z'
  },
  {
    _id: '102',
    name: 'Vũ Minh Hiếu',
    email: 'hieu@example.com',
    phone: '0912345678',
    group: { _id: '2', name: 'VIP' },
    totalOrders: 12,
    totalSpent: 85700000,
    createdAt: '2022-03-15T10:20:00Z',
    lastOrderDate: '2023-08-15T09:45:00Z'
  },
  {
    _id: '103',
    name: 'Đỗ Thành Nam',
    email: 'nam@example.com',
    phone: '0923456789',
    group: { _id: '2', name: 'VIP' },
    totalOrders: 8,
    totalSpent: 53400000,
    createdAt: '2022-06-20T14:15:00Z',
    lastOrderDate: '2023-08-15T10:15:00Z'
  },
  {
    _id: '104',
    name: 'Trần Thị Bình',
    email: 'binh@example.com',
    phone: '0934567890',
    group: { _id: '1', name: 'Regular' },
    totalOrders: 3,
    totalSpent: 9800000,
    createdAt: '2022-08-05T09:30:00Z',
    lastOrderDate: '2023-08-15T10:20:00Z'
  },
  {
    _id: '105',
    name: 'Nguyễn Minh Tuấn',
    email: 'tuan@example.com',
    phone: '0945678901',
    group: { _id: '3', name: 'Wholesale' },
    totalOrders: 15,
    totalSpent: 120500000,
    createdAt: '2022-02-10T08:45:00Z',
    lastOrderDate: '2023-08-14T08:30:00Z'
  }
];

// Mock data for customer groups
export const mockCustomerGroups = [
  {
    _id: '1',
    name: 'Regular',
    description: 'Standard customers',
    discount: 0,
    minimumSpend: 0,
    memberCount: 150,
    createdAt: '2022-01-10T08:30:00Z'
  },
  {
    _id: '2',
    name: 'VIP',
    description: 'Customers with high spending volume',
    discount: 10,
    minimumSpend: 50000000,
    memberCount: 45,
    createdAt: '2022-01-10T08:35:00Z'
  },
  {
    _id: '3',
    name: 'Wholesale',
    description: 'Business customers who buy in bulk',
    discount: 15,
    minimumSpend: 100000000,
    memberCount: 12,
    createdAt: '2022-01-10T08:40:00Z'
  }
];

// Mock data for discounts
export const mockDiscounts = [
  {
    _id: '1',
    name: 'Summer Sale',
    description: 'Special summer promotion with discounts on selected items',
    type: 'percentage',
    value: 20,
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    isActive: true,
    appliesTo: 'categories',
    categoryIds: ['4', '5'],
    productIds: [],
    minimumPurchase: 0,
    usageLimit: null,
    usageCount: 546,
    createdAt: '2023-05-15T10:30:00Z'
  },
  {
    _id: '2',
    name: 'Sữa Flash Sale',
    description: 'Limited time discount on Sữa',
    type: 'percentage',
    value: 15,
    startDate: '2023-08-10T00:00:00Z',
    endDate: '2023-08-20T23:59:59Z',
    isActive: true,
    appliesTo: 'categories',
    categoryIds: ['1', '2', '3'],
    productIds: [],
    minimumPurchase: 5000000,
    usageLimit: 500,
    usageCount: 243,
    createdAt: '2023-07-25T14:20:00Z'
  },
  {
    _id: '3',
    name: 'Premium Laptops Promotion',
    description: 'Special discount on high-end laptops',
    type: 'fixed',
    value: 2000000,
    startDate: '2023-08-05T00:00:00Z',
    endDate: '2023-09-05T23:59:59Z',
    isActive: true,
    appliesTo: 'products',
    categoryIds: [],
    productIds: ['3', '10', '15'],
    minimumPurchase: 20000000,
    usageLimit: 100,
    usageCount: 37,
    createdAt: '2023-07-30T09:15:00Z'
  }
];

// Mock data for coupons
export const mockCoupons = [
  {
    _id: '1',
    code: 'WELCOME20',
    description: 'Welcome discount for new customers',
    type: 'percentage',
    value: 20,
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    isActive: true,
    minimumPurchase: 1000000,
    usageLimit: 1,
    usageCount: 127,
    createdAt: '2022-12-15T10:30:00Z'
  },
  {
    _id: '2',
    code: 'SUMMER50',
    description: 'Special summer promotion',
    type: 'percentage',
    value: 50,
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    isActive: true,
    minimumPurchase: 5000000,
    usageLimit: 1,
    usageCount: 83,
    createdAt: '2023-05-20T14:20:00Z'
  },
  {
    _id: '3',
    code: 'FREESHIP',
    description: 'Free shipping on all orders',
    type: 'fixed',
    value: 50000,
    startDate: '2023-08-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    isActive: true,
    minimumPurchase: 0,
    usageLimit: null,
    usageCount: 215,
    createdAt: '2023-07-25T09:15:00Z'
  }
];

// Mock data for banners
export const mockBanners = [
  {
    _id: '1',
    title: 'Summer Collection 2023',
    description: 'Explore our new summer collection with up to 50% discount',
    image: 'https://via.placeholder.com/1200x400',
    url: '/category/clothing',
    isActive: true,
    position: 'home_top',
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    createdAt: '2023-05-15T10:30:00Z'
  },
  {
    _id: '2',
    title: 'New Sữa Arrivals',
    description: 'Check out the latest gadgets with special launch offers',
    image: 'https://via.placeholder.com/1200x400',
    url: '/category/sua',
    isActive: true,
    position: 'home_middle',
    startDate: '2023-08-01T00:00:00Z',
    endDate: '2023-09-15T23:59:59Z',
    createdAt: '2023-07-20T14:20:00Z'
  },
  {
    _id: '3',
    title: 'Back to School Sale',
    description: 'Get ready for the new school year with amazing offers',
    image: 'https://via.placeholder.com/600x300',
    url: '/category/computers',
    isActive: true,
    position: 'sidebar',
    startDate: '2023-08-10T00:00:00Z',
    endDate: '2023-09-10T23:59:59Z',
    createdAt: '2023-07-25T09:15:00Z'
  }
];

// Mock data for settings
export const mockGeneralSettings = {
  siteName: '2NADH',
  siteDescription: 'Your one-stop shop for everything digital',
  logo: 'https://via.placeholder.com/200x50',
  favicon: 'https://via.placeholder.com/32x32',
  email: 'contact@2NADH.com',
  phone: '(+84) 28 1234 5678',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  socialLinks: {
    facebook: 'https://facebook.com/2NADH',
    twitter: 'https://twitter.com/2NADH',
    instagram: 'https://instagram.com/2NADH'
  },
  metaTags: {
    title: '2NADH - Premium Sữa Store',
    description: 'Shop the latest Sữa, gadgets, and tech accessories',
    keywords: 'Sữa, gadgets, smartphones, laptops, Vietnam'
  },
  currencyCode: 'VND',
  currencySymbol: '₫',
  currencyPosition: 'after',
  thousandSeparator: '.',
  decimalSeparator: ',',
  numberOfDecimals: 0
};

export const mockPaymentSettings = {
  enabledPaymentMethods: {
    cod: true,
    bankTransfer: true,
    creditCard: true,
    ewallet: true
  },
  bankTransferInstructions: 'Please transfer the payment to account number: 123456789 at VietBank',
  codInstructions: 'Pay in cash when the package is delivered',
  paymentGateways: {
    stripe: {
      enabled: true,
      testMode: true,
      publishableKey: 'pk_test_123456789',
      secretKey: 'sk_test_123456789'
    },
    paypal: {
      enabled: true,
      testMode: true,
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret'
    },
    momo: {
      enabled: true,
      testMode: true,
      partnerCode: 'MOMO123456',
      accessKey: 'momo_access_key',
      secretKey: 'momo_secret_key'
    }
  }
};

export const mockShippingSettings = {
  enabledShippingMethods: {
    standardShipping: true,
    expressShipping: true,
    sameDay: false
  },
  shippingMethods: [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery within 3-5 business days',
      cost: 30000,
      freeAbove: 1000000
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery within 1-2 business days',
      cost: 60000,
      freeAbove: 2000000
    },
    {
      id: 'sameday',
      name: 'Same Day Delivery',
      description: 'Delivery on the same day for orders before 2 PM',
      cost: 100000,
      freeAbove: null
    }
  ],
  shippingZones: [
    {
      id: 'zone1',
      name: 'North Vietnam',
      provinces: ['Hanoi', 'Hai Phong', 'Quang Ninh'],
      additionalCost: 0
    },
    {
      id: 'zone2',
      name: 'Central Vietnam',
      provinces: ['Da Nang', 'Hue', 'Quang Nam'],
      additionalCost: 15000
    },
    {
      id: 'zone3',
      name: 'South Vietnam',
      provinces: ['Ho Chi Minh', 'Can Tho', 'Dong Nai'],
      additionalCost: 0
    }
  ]
}; 

// Mock data for users
export const mockUsers = [
  {
    _id: '682156b9cd847bbb9bc14045',
    name: 'Test User',
    email: 'lethunhi125+0@gmail.com',
    isAdmin: false,
    createdAt: '2023-05-12T10:30:00Z'
  },
  {
    _id: '68215b3dcfe6444b8a1c5b34',
    name: 'Test User',
    email: 'lethunhi125+1@gmail.com',
    isAdmin: false,
    createdAt: '2023-05-12T10:30:00Z'
  },
  {
    _id: '68215c3ecfe6444b8a1c5b3c',
    name: 'NHILE',
    email: 'lethunhi125+2@gmail.com',
    isAdmin: false,
    createdAt: '2023-05-12T10:30:00Z'
  },
  {
    _id: '6828f34cb7b205bbbe763bb4',
    name: 'nh',
    email: 'lethunhi125@gmail.com',
    isAdmin: true,
    createdAt: '2023-05-18T10:30:00Z'
  },
  {
    _id: '682a1bb54c2af669da80dda1',
    name: 'Bao Ngoc Mai',
    email: 'maithibaongoc_t67@hus.edu.vn',
    isAdmin: false,
    createdAt: '2023-05-19T10:30:00Z'
  },
  {
    _id: '682b1f1bced361ba2c839e93',
    name: 'Hoang Minh Diep',
    email: 'diep1422811@gmail.com',
    isAdmin: false,
    createdAt: '2023-05-19T10:30:00Z'
  }
]; 