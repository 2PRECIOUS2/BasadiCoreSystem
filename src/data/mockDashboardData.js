// Mock dashboard data based on ACTUAL Basadi data from screenshots
// This provides realistic data for dashboard when backend is not available

export const mockAnalyticsData = {
  totalOrders: 156,
  totalCustomers: 89,
  totalProducts: 47,
  totalMaterials: 125,
  totalRevenue: 245750.50,
  recentOrders: [
    {
      orderid: 30,
      totalamount: 1400.00,
      orderstatus: 'pending',
      createdat: '2025-10-23T10:30:00Z',
      cust_fname: 'Kuhle',
      cust_lname: 'Zuma'
    },
    {
      orderid: 29,
      totalamount: 129.90,
      orderstatus: 'pending',
      createdat: '2025-10-10T14:15:00Z',
      cust_fname: 'Thobisile',
      cust_lname: 'Majozi'
    },
    {
      orderid: 28,
      totalamount: 129.90,
      orderstatus: 'delivered',
      createdat: '2025-10-10T09:20:00Z',
      cust_fname: 'Bophelo',
      cust_lname: 'Mphuthi'
    },
    {
      orderid: 27,
      totalamount: 20.00,
      orderstatus: 'delivered',
      createdat: '2025-10-09T16:45:00Z',
      cust_fname: 'Pimville',
      cust_lname: 'Society'
    },
    {
      orderid: 26,
      totalamount: 20.00,
      orderstatus: 'pending',
      createdat: '2025-10-11T11:30:00Z',
      cust_fname: 'Ariana',
      cust_lname: 'Carrots'
    },
    {
      orderid: 25,
      totalamount: 129.90,
      orderstatus: 'cancelled',
      createdat: '2025-10-29T11:30:00Z',
      cust_fname: 'nthabi',
      cust_lname: 'zai'
    },
    {
      orderid: 24,
      totalamount: 129.90,
      orderstatus: 'delivered',
      createdat: '2025-09-18T11:30:00Z',
      cust_fname: 'Nontokozo',
      cust_lname: 'Zuma'
    }
  ]
};

export const mockSalesReportData = {
  ordersByStatus: [
    { orderstatus: 'delivered', count: 67 },
    { orderstatus: 'pending', count: 23 },
    { orderstatus: 'processing', count: 31 },
    { orderstatus: 'shipped', count: 19 },
    { orderstatus: 'cancelled', count: 8 },
    { orderstatus: 'returned', count: 4 }
  ],
  monthlySales: [
    { month: '2025-01', revenue: 18500.00, orders: 15 },
    { month: '2025-02', revenue: 22750.50, orders: 18 },
    { month: '2025-03', revenue: 19200.25, orders: 16 },
    { month: '2025-04', revenue: 26100.75, orders: 21 },
    { month: '2025-05', revenue: 24800.00, orders: 20 },
    { month: '2025-06', revenue: 28900.50, orders: 24 },
    { month: '2025-07', revenue: 31200.25, orders: 26 },
    { month: '2025-08', revenue: 29500.00, orders: 23 },
    { month: '2025-09', revenue: 33750.75, orders: 28 },
    { month: '2025-10', revenue: 30900.50, orders: 25 }
  ],
  topProducts: [
    { productname: 'Nigerian men Shirt', total_sold: 45, revenue: 54000.00 }, // R1200.00 × 45
    { productname: 'African Print Jersey', total_sold: 38, revenue: 34200.00 }, // R900.00 × 38
    { productname: 'Giyana Shirt', total_sold: 32, revenue: 15840.00 }, // R495.00 × 32
    { productname: 'FoldOver Clutch Purse', total_sold: 28, revenue: 12600.00 }, // R450.00 × 28
    { productname: 'African Print Headwrap', total_sold: 25, revenue: 5500.00 }, // R220.00 × 25
    { productname: 'Make Up Bag', total_sold: 22, revenue: 4400.00 }, // R200.00 × 22
    { productname: 'Wakanda Wax Print', total_sold: 20, revenue: 3732.00 }, // R186.50 × 20
    { productname: 'Ankara head wrap', total_sold: 18, revenue: 2338.20 }, // R129.90 × 18
    { productname: 'Ruroni Bonnets', total_sold: 15, revenue: 2250.00 }, // R150.00 × 15
    { productname: 'mats', total_sold: 12, revenue: 1440.00 } // R120.00 × 12
  ]
};

export const mockCustomerReportData = {
  stats: {
    total_customers: 89,
    new_customers: 12
  },
  topCustomers: [
    { name: 'Ariana Carrots', email: 'ArianaCarrots@gmail.com', total_orders: 3, total_spent: 1500.75 },
    { name: 'Kuhle Zuma', email: 'kuhlezuma@gmail.com', total_orders: 1, total_spent: 1400.00 },
    { name: 'Thobisile Majozi', email: 'thobisilemajozi@gmail.com', total_orders: 1, total_spent: 129.90 },
    { name: 'Bophelo Mphuthi', email: 'N/A', total_orders: 1, total_spent: 129.90 },
    { name: 'Nontokozo Zuma', email: 'N/A', total_orders: 1, total_spent: 129.90 },
    { name: 'nthabi zai', email: 'N/A', total_orders: 1, total_spent: 129.90 },
    { name: 'Thandi Moyo', email: 'thandi.moyo@gmail.com', total_orders: 0, total_spent: 0.00 },
    { name: 'Sibusiso Mthembu', email: 'sibusiso@gmail.com', total_orders: 0, total_spent: 0.00 }
  ],
  cities: [
    { city: 'Johannesburg', order_count: 45 },
    { city: 'Pretoria', order_count: 32 },
    { city: 'Cape Town', order_count: 28 },
    { city: 'Durban', order_count: 18 },
    { city: 'Gauteng', order_count: 15 },
    { city: 'Port Elizabeth', order_count: 12 },
    { city: 'Bloemfontein', order_count: 8 },
    { city: 'Polokwane', order_count: 6 }
  ]
};

export const mockMaterialReportData = {
  stats: {
    total_materials: 125
  },
  stockLevels: [
    { materialname: 'Cotton Fabric', total_quantity: 45, unit: 'meters', stock_entries: 5, avg_price: 25.50 },
    { materialname: 'Silk Thread', total_quantity: 120, unit: 'items', stock_entries: 8, avg_price: 12.75 },
    { materialname: 'Beads Assorted', total_quantity: 300, unit: 'items', stock_entries: 12, avg_price: 5.25 },
    { materialname: 'Leather Strips', total_quantity: 25, unit: 'meters', stock_entries: 3, avg_price: 45.00 },
    { materialname: 'Embroidery Floss', total_quantity: 80, unit: 'items', stock_entries: 6, avg_price: 8.50 },
    { materialname: 'Ankara Fabric', total_quantity: 35, unit: 'meters', stock_entries: 4, avg_price: 32.00 },
    { materialname: 'Metal Fasteners', total_quantity: 200, unit: 'items', stock_entries: 10, avg_price: 3.75 },
    { materialname: 'Denim Fabric', total_quantity: 20, unit: 'meters', stock_entries: 2, avg_price: 28.90 },
    { materialname: 'Sequins', total_quantity: 500, unit: 'items', stock_entries: 15, avg_price: 2.10 },
    { materialname: 'Kente Fabric', total_quantity: 15, unit: 'meters', stock_entries: 2, avg_price: 85.00 }
  ],
  recentPurchases: [
    { purchase_date: '2025-10-09', daily_cost: 1500.00, purchase_count: 3 },
    { purchase_date: '2025-10-08', daily_cost: 2500.00, purchase_count: 5 },
    { purchase_date: '2025-10-07', daily_cost: 800.00, purchase_count: 2 },
    { purchase_date: '2025-10-06', daily_cost: 3200.00, purchase_count: 7 },
    { purchase_date: '2025-10-05', daily_cost: 1200.00, purchase_count: 4 },
    { purchase_date: '2025-10-04', daily_cost: 900.00, purchase_count: 2 },
    { purchase_date: '2025-10-03', daily_cost: 1800.00, purchase_count: 6 },
    { purchase_date: '2025-10-02', daily_cost: 2100.00, purchase_count: 4 }
  ]
};

export const mockProductOrdersData = {
  productOrders: [
    { productname: 'African Print Dress', price: 300.00, times_ordered: 45, total_quantity: 67, total_revenue: 20100.00 },
    { productname: 'Corporate Gift Set', price: 250.00, times_ordered: 38, total_quantity: 52, total_revenue: 13000.00 },
    { productname: 'Custom Ankara Shirt', price: 180.00, times_ordered: 32, total_quantity: 48, total_revenue: 8640.00 },
    { productname: 'Beaded Accessories', price: 120.00, times_ordered: 28, total_quantity: 42, total_revenue: 5040.00 },
    { productname: 'Traditional Headwrap', price: 85.00, times_ordered: 25, total_quantity: 35, total_revenue: 2975.00 },
    { productname: 'Embroidered Dashiki', price: 220.00, times_ordered: 22, total_quantity: 28, total_revenue: 6160.00 },
    { productname: 'Leather Handbag', price: 450.00, times_ordered: 20, total_quantity: 22, total_revenue: 9900.00 },
    { productname: 'Kente Cloth Scarf', price: 95.00, times_ordered: 18, total_quantity: 25, total_revenue: 2375.00 },
    { productname: 'Wooden Jewelry', price: 65.00, times_ordered: 15, total_quantity: 20, total_revenue: 1300.00 },
    { productname: 'Brass Ornaments', price: 40.00, times_ordered: 12, total_quantity: 18, total_revenue: 720.00 }
  ],
  categoryPerformance: [
    { category: 'African print-inspired custom clothing', product_count: 18, total_orders: 125, category_revenue: 45200.50 },
    { category: 'Fashion Accessories', product_count: 15, total_orders: 98, category_revenue: 28750.25 },
    { category: 'Corporate Gifts', product_count: 14, total_orders: 87, category_revenue: 32100.75 }
  ]
};

// Mock data service to simulate API calls
export const mockDashboardService = {
  async getAnalytics() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAnalyticsData;
  },

  async getSalesReport() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSalesReportData;
  },

  async getCustomerReport() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCustomerReportData;
  },

  async getMaterialReport() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMaterialReportData;
  },

  async getProductOrders() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProductOrdersData;
  }
};

export default mockDashboardService;