import baseApi from './baseApi';

class AnalyticsService {
  // Get comprehensive analytics for a restaurant
  async getRestaurantAnalytics(restaurantId) {
    try {
      // Fetch all data in parallel
      const [ordersRes, menusRes, itemsRes] = await Promise.all([
        baseApi.get('/orders/getAll'),
        baseApi.get('/restaurants/menu/getAll'),
        baseApi.get('/restaurants/item/getAll')
      ]);

      // Filter data for this restaurant
      const restaurantOrders = ordersRes.data?.orders?.filter(order => 
        order.restaurant_id === parseInt(restaurantId)
      ) || [];

      const restaurantMenus = menusRes.data?.menus?.filter(menu => 
        menu.restaurant_id === parseInt(restaurantId)
      ) || [];

      const restaurantItems = itemsRes.data?.items?.filter(item => 
        item.restaurant_id === parseInt(restaurantId)
      ) || [];

      return {
        orders: restaurantOrders,
        menus: restaurantMenus,
        items: restaurantItems
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        orders: [],
        menus: [],
        items: []
      };
    }
  }

  // Filter orders by time range (used for stats and charts)
  filterOrdersByTimeRange(orders, timeRange, customRange = null) {
    if (customRange && customRange.startDate && customRange.endDate) {
      const startDate = new Date(customRange.startDate);
      const endDate = new Date(customRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      return orders.filter(order => {
        const createdAt = order.createdAt || order.created_at;
        if (!createdAt) return false;
        const orderDate = new Date(createdAt);
        if (isNaN(orderDate.getTime())) return false;
        return orderDate >= startDate && orderDate <= endDate;
      });
    } else if (timeRange === 'all') {
      return orders; // Return all orders
    } else {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - timeRange);
      startDate.setHours(0, 0, 0, 0);
      
      return orders.filter(order => {
        const createdAt = order.createdAt || order.created_at;
        if (!createdAt) return false;
        const orderDate = new Date(createdAt);
        if (isNaN(orderDate.getTime())) return false;
        return orderDate >= startDate;
      });
    }
  }

  // Calculate order statistics with time range filter
  calculateOrderStats(orders, customRange = null, timeRange = 30) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter orders by the selected time range first
    const filteredOrders = this.filterOrdersByTimeRange(orders, timeRange, customRange);

    // Filter orders by status - update status mappings based on your database
    const completedOrders = filteredOrders.filter(order => 
      order.status === 'delivered' || 
      order.status === 'completed' || 
      order.status === 'confirmed'
    );
    const pendingOrders = filteredOrders.filter(order => 
      order.status === 'pending' || 
      order.status === 'preparing' ||
      order.status === 'confirmed'
    );
    const deliveryOrders = filteredOrders.filter(order => 
      order.status === 'delivering' || 
      order.status === 'ready'
    );
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');

    // Calculate revenue from completed orders only
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
    
    // Monthly revenue (only for current month, not affected by time range filter)
    const monthlyRevenue = orders
      .filter(order => {
        const createdAt = order.createdAt || order.created_at;
        if (!createdAt) return false;
        
        const orderDate = new Date(createdAt);
        // Check if the date is valid
        if (isNaN(orderDate.getTime())) return false;
        
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear &&
               (order.status === 'delivered' || order.status === 'completed' || order.status === 'confirmed');
      })
      .reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);

    return {
      totalOrders: filteredOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      deliveryOrders: deliveryOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      monthlyRevenue,
      averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
    };
  }

  // Get orders by day for the last N days, custom date range, or all time
  getOrdersByDay(orders, days = 30, customRange = null) {
    const result = [];
    let startDate, endDate;

    // If orders are already filtered (which is the case), we should analyze the date range of the provided orders
    if (orders.length === 0) {
      // Even with no orders, we should show the expected date range for preset filters
      if (typeof days === 'number') {
        const now = new Date();
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return [];
      }
    } else {
      // Determine date range based on the filter type
      if (typeof days === 'object' && days.start && days.end) {
        // Custom date range passed as object
        startDate = new Date(days.start);
        endDate = new Date(days.end);
        endDate.setHours(23, 59, 59, 999);
      } else if (customRange && customRange.startDate && customRange.endDate) {
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (days === 'all') {
        // For "all time", find the date range from the provided orders
        const dates = orders.map(order => {
          const createdAt = order.createdAt || order.created_at;
          return createdAt ? new Date(createdAt) : null;
        }).filter(date => date && !isNaN(date.getTime()));
        
        if (dates.length === 0) return [];
        
        startDate = new Date(Math.min(...dates));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(Math.max(...dates));
        endDate.setHours(23, 59, 59, 999);
      } else if (typeof days === 'number') {
        // For preset filters (7, 30, 90 days), ALWAYS use current date as reference
        // This ensures today is always included, regardless of whether there are orders today
        const now = new Date();
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
      } else if (days === 'filtered') {
        // Special case: when orders are already filtered and we want to use their date range
        const dates = orders.map(order => {
          const createdAt = order.createdAt || order.created_at;
          return createdAt ? new Date(createdAt) : null;
        }).filter(date => date && !isNaN(date.getTime()));
        
        if (dates.length === 0) return [];
        
        startDate = new Date(Math.min(...dates));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(Math.max(...dates));
        endDate.setHours(23, 59, 59, 999);
      }
    }

    // Generate daily data for the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const createdAt = order.createdAt || order.created_at;
        if (!createdAt) return false;
        
        const orderDate = new Date(createdAt);
        if (isNaN(orderDate.getTime())) return false;
        
        // Compare just the date part (YYYY-MM-DD)
        const orderDateStr = orderDate.toISOString().split('T')[0];
        return orderDateStr === dateStr;
      });

      result.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders
          .filter(order => 
            order.status === 'completed' || 
            order.status === 'delivered' || 
            order.status === 'confirmed'
          )
          .reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  // Get popular items
  getPopularItems(orders, items) {
    const itemCounts = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(orderItem => {
          const itemId = orderItem.item_id || orderItem.id;
          itemCounts[itemId] = (itemCounts[itemId] || 0) + (orderItem.quantity || 1);
        });
      }
    });

    // Get top items with details
    const popularItems = Object.entries(itemCounts)
      .map(([itemId, count]) => {
        const item = items.find(i => i.id === parseInt(itemId));
        return {
          id: itemId,
          name: item?.name || 'Item inconnu',
          count,
          revenue: count * (parseFloat(item?.price) || 0)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return popularItems;
  }

  // Get order status distribution
  getOrderStatusDistribution(orders) {
    const statusCounts = {
      pending: 0,
      preparing: 0,
      confirmed: 0,
      ready: 0,
      delivering: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.status || 'pending';
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++;
      }
    });

    return statusCounts;
  }

  // Get monthly comparison
  getMonthlyComparison(orders) {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = orders.filter(order => {
        const createdAt = order.createdAt || order.created_at;
        if (!createdAt) return false;
        
        const orderDate = new Date(createdAt);
        // Check if the date is valid
        if (isNaN(orderDate.getTime())) return false;
        
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });

      const revenue = monthOrders
        .filter(order => 
          order.status === 'completed' || 
          order.status === 'delivered' || 
          order.status === 'confirmed'
        )
        .reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);

      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        orders: monthOrders.length,
        revenue
      });
    }

    return months;
  }

  // Main method to get analytics with time filtering
  async getAnalytics(restaurantId, timeRange = 30) {
    try {
      console.log('Getting analytics for restaurant:', restaurantId, 'with time range:', timeRange);
      
      // Get all restaurant data
      const analyticsData = await this.getRestaurantAnalytics(restaurantId);
      
      // Apply time filter to orders
      let filteredOrders;
      if (typeof timeRange === 'object' && timeRange.start && timeRange.end) {
        // Custom date range
        filteredOrders = this.filterOrdersByTimeRange(analyticsData.orders, null, {
          startDate: timeRange.start,
          endDate: timeRange.end
        });
      } else {
        // Preset time range or 'all'
        filteredOrders = this.filterOrdersByTimeRange(analyticsData.orders, timeRange);
      }
      
      console.log('Filtered orders count:', filteredOrders.length);
      
      return {
        orders: filteredOrders,
        items: analyticsData.items,
        menus: analyticsData.menus
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return {
        orders: [],
        items: [],
        menus: []
      };
    }
  }
}

export const analyticsService = new AnalyticsService();