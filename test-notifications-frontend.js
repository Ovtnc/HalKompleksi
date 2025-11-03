/**
 * Frontend Notification System Test
 * 
 * This script tests the notification system from the frontend perspective
 * by simulating API calls and checking the notification screen functionality.
 */

const API_BASE_URL = 'http://109.199.114.223:5001/api';

// Test data - using existing user
const testCredentials = {
  email: 'buyer@test.com',
  password: 'test123'
};

const testProductRequest = {
  category: 'meyve',
  keywords: ['test', 'frontend'],
  city: 'İstanbul'
};

class FrontendNotificationTester {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Testing ${testName}...`);
    try {
      const result = await testFunction();
      console.log(`✅ ${testName}: PASSED`);
      this.testResults.push({ test: testName, status: 'PASSED', result });
      return result;
    } catch (error) {
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
      this.testResults.push({ test: testName, status: 'FAILED', error: error.message });
      return null;
    }
  }

  async authenticate() {
    return this.runTest('Authentication', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      this.authToken = data.token;
      
      if (!this.authToken) {
        throw new Error('No token received');
      }

      return { user: data.user, token: this.authToken };
    });
  }

  async testGetNotifications() {
    return this.runTest('Get Notifications', async () => {
      const response = await fetch(`${API_BASE_URL}/notifications?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Get notifications failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.hasOwnProperty('notifications') || !Array.isArray(data.notifications)) {
        throw new Error('Invalid notifications response structure');
      }

      console.log(`📱 Found ${data.notifications.length} notifications`);
      console.log(`📊 Unread count: ${data.unreadCount || 0}`);
      
      return data;
    });
  }

  async testCreateProductRequest() {
    return this.runTest('Create Product Request', async () => {
      const response = await fetch(`${API_BASE_URL}/notifications/product-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(testProductRequest)
      });

      if (!response.ok) {
        throw new Error(`Create product request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.request) {
        throw new Error('No request object in response');
      }

      console.log(`📋 Created product request: ${data.request.category}`);
      return data;
    });
  }

  async testGetProductRequests() {
    return this.runTest('Get Product Requests', async () => {
      const response = await fetch(`${API_BASE_URL}/notifications/product-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Get product requests failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.hasOwnProperty('requests') || !Array.isArray(data.requests)) {
        throw new Error('Invalid product requests response structure');
      }

      console.log(`📋 Found ${data.requests.length} product requests`);
      return data;
    });
  }

  async testMarkNotificationAsRead() {
    return this.runTest('Mark Notification as Read', async () => {
      // First get notifications to find one to mark as read
      const notificationsResponse = await fetch(`${API_BASE_URL}/notifications?page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!notificationsResponse.ok) {
        throw new Error('Failed to get notifications for read test');
      }

      const notificationsData = await notificationsResponse.json();
      const notifications = notificationsData.notifications || [];

      if (notifications.length === 0) {
        console.log('ℹ️  No notifications to mark as read');
        return { message: 'No notifications available' };
      }

      // Find an unread notification
      const unreadNotification = notifications.find(n => !n.isRead);
      
      if (!unreadNotification) {
        console.log('ℹ️  All notifications are already read');
        return { message: 'All notifications already read' };
      }

      // Mark it as read
      const response = await fetch(`${API_BASE_URL}/notifications/${unreadNotification._id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Mark as read failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Marked notification as read: ${unreadNotification.title}`);
      return data;
    });
  }

  async testMarkAllNotificationsAsRead() {
    return this.runTest('Mark All Notifications as Read', async () => {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Mark all as read failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Marked all notifications as read');
      return data;
    });
  }

  async testDeleteNotification() {
    return this.runTest('Delete Notification', async () => {
      // First get notifications to find one to delete
      const notificationsResponse = await fetch(`${API_BASE_URL}/notifications?page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!notificationsResponse.ok) {
        throw new Error('Failed to get notifications for delete test');
      }

      const notificationsData = await notificationsResponse.json();
      const notifications = notificationsData.notifications || [];

      if (notifications.length === 0) {
        console.log('ℹ️  No notifications to delete');
        return { message: 'No notifications available' };
      }

      // Find a notification to delete (prefer system notifications for testing)
      const notificationToDelete = notifications.find(n => n.type === 'system') || notifications[0];

      const response = await fetch(`${API_BASE_URL}/notifications/${notificationToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Delete notification failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Deleted notification: ${notificationToDelete.title}`);
      return data;
    });
  }

  async testDeleteProductRequest() {
    return this.runTest('Delete Product Request', async () => {
      // First get product requests to find one to delete
      const requestsResponse = await fetch(`${API_BASE_URL}/notifications/product-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!requestsResponse.ok) {
        throw new Error('Failed to get product requests for delete test');
      }

      const requestsData = await requestsResponse.json();
      const requests = requestsData.requests || [];

      if (requests.length === 0) {
        console.log('ℹ️  No product requests to delete');
        return { message: 'No product requests available' };
      }

      // Find a request to delete
      const requestToDelete = requests.find(r => r.category === 'meyve') || requests[0];

      const response = await fetch(`${API_BASE_URL}/notifications/product-requests/${requestToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Delete product request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Deleted product request: ${requestToDelete.category}`);
      return data;
    });
  }

  async testNotificationTypes() {
    return this.runTest('Notification Types Validation', async () => {
      const response = await fetch(`${API_BASE_URL}/notifications?page=1&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Get notifications failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const notifications = data.notifications || [];

      // Check for different notification types
      const types = [...new Set(notifications.map(n => n.type))];
      console.log(`📊 Found notification types: ${types.join(', ')}`);

      // Validate notification structure
      const invalidNotifications = notifications.filter(n => 
        !n._id || !n.title || !n.message || !n.type || !n.createdAt
      );

      if (invalidNotifications.length > 0) {
        throw new Error(`Found ${invalidNotifications.length} notifications with invalid structure`);
      }

      return { types, count: notifications.length };
    });
  }

  async testNotificationPagination() {
    return this.runTest('Notification Pagination', async () => {
      // Test first page
      const page1Response = await fetch(`${API_BASE_URL}/notifications?page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!page1Response.ok) {
        throw new Error(`Get page 1 failed: ${page1Response.status} ${page1Response.statusText}`);
      }

      const page1Data = await page1Response.json();
      
      // Test second page
      const page2Response = await fetch(`${API_BASE_URL}/notifications?page=2&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!page2Response.ok) {
        throw new Error(`Get page 2 failed: ${page2Response.status} ${page2Response.statusText}`);
      }

      const page2Data = await page2Response.json();

      console.log(`📄 Page 1: ${page1Data.notifications.length} notifications`);
      console.log(`📄 Page 2: ${page2Data.notifications.length} notifications`);
      console.log(`📊 Total pages: ${page1Data.totalPages || 'unknown'}`);

      return { page1: page1Data, page2: page2Data };
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend Notification System Tests...\n');
    
    try {
      // Authenticate first
      const authResult = await this.authenticate();
      if (!authResult) {
        throw new Error('Authentication failed - cannot continue tests');
      }

      // Run all tests
      await this.testGetNotifications();
      await this.testCreateProductRequest();
      await this.testGetProductRequests();
      await this.testMarkNotificationAsRead();
      await this.testMarkAllNotificationsAsRead();
      await this.testDeleteNotification();
      await this.testDeleteProductRequest();
      await this.testNotificationTypes();
      await this.testNotificationPagination();

      // Print results
      this.printTestResults();

    } catch (error) {
      console.error('❌ Test execution error:', error);
    }
  }

  printTestResults() {
    console.log('\n📊 FRONTEND TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      const error = result.error ? ` - Error: ${result.error}` : '';
      console.log(`${index + 1}. ${status} ${result.test}${error}`);
    });
    
    if (failed === 0) {
      console.log('\n🎉 All frontend tests passed! Notification system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
  }
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  const tester = new FrontendNotificationTester();
  tester.runAllTests().catch(console.error);
} else {
  // Browser environment
  console.log('Frontend notification tester loaded. Run tester.runAllTests() to start tests.');
  window.FrontendNotificationTester = FrontendNotificationTester;
}

module.exports = FrontendNotificationTester;
