// Dashboard service that handles both real API calls and mock data fallback
import { API_BASE_URL } from '../config';
import mockDashboardService from './mockDashboardData';

class DashboardService {
  constructor() {
    this.useMockData = false;
  }

  async makeRequest(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/${endpoint}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API call failed for ${endpoint}, using mock data:`, error.message);
      this.useMockData = true;
      throw error;
    }
  }

  async getAnalytics() {
    try {
      return await this.makeRequest('analytics');
    } catch (error) {
      return mockDashboardService.getAnalytics();
    }
  }

  async getSalesReport() {
    try {
      return await this.makeRequest('sales-report');
    } catch (error) {
      return mockDashboardService.getSalesReport();
    }
  }

  async getCustomerReport() {
    try {
      return await this.makeRequest('customer-report');
    } catch (error) {
      return mockDashboardService.getCustomerReport();
    }
  }

  async getMaterialReport() {
    try {
      return await this.makeRequest('material-report');
    } catch (error) {
      return mockDashboardService.getMaterialReport();
    }
  }

  async getProductOrders() {
    try {
      return await this.makeRequest('product-orders');
    } catch (error) {
      return mockDashboardService.getProductOrders();
    }
  }

  // Method to check if currently using mock data
  isUsingMockData() {
    return this.useMockData;
  }

  // Method to force mock data (for testing/demo purposes)
  forceMockData(force = true) {
    this.useMockData = force;
  }
}

// Export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;