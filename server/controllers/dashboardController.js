const Car = require('../models/Car');
const InventoryHistory = require('../models/InventoryHistory');
const User = require('../models/User');

/**
 * @desc    Get all dashboard statistics and chart data
 * @route   GET /api/dashboard
 * @access  Private/Admin
 */
const getDashboard = async (req, res, next) => {
  try {
    // ── Parallel aggregations for performance ────────────────────────────────
    const [
      totalCars,
      totalStock,
      outOfStock,
      recentCars,
      carsByCategory,
      carsByFuelType,
      stockTrend,
      totalInventoryValue,
      totalSold,
      topBrands,
      recentPurchases,
      monthlyRevenue,
    ] = await Promise.all([
      // Total cars
      Car.countDocuments(),

      // Total stock units
      Car.aggregate([
        { $group: { _id: null, total: { $sum: '$stockQuantity' } } },
      ]),

      // Out of stock cars
      Car.countDocuments({ status: 'out_of_stock' }),

      // Recently added cars (last 5)
      Car.find().sort('-createdAt').limit(5).select('name brand price image status stockQuantity createdAt'),

      // Cars by category (Pie Chart)
      Car.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, value: { $sum: '$price' } } },
        { $sort: { count: -1 } },
      ]),

      // Cars by fuel type
      Car.aggregate([
        { $group: { _id: '$fuelType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Stock by category (Bar Chart)
      Car.aggregate([
        {
          $group: {
            _id: '$category',
            totalStock: { $sum: '$stockQuantity' },
            avgPrice: { $avg: '$price' },
            carCount: { $sum: 1 },
          },
        },
        { $sort: { totalStock: -1 } },
      ]),

      // Total inventory value
      Car.aggregate([
        { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } } } },
      ]),

      // Total cars sold
      Car.aggregate([
        { $group: { _id: null, totalSold: { $sum: '$totalSold' } } },
      ]),

      // Top brands by count
      Car.aggregate([
        { $group: { _id: '$brand', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Recent purchase history (last 10)
      InventoryHistory.find({ action: 'purchase' })
        .sort('-createdAt')
        .limit(10)
        .populate('car', 'name brand')
        .populate('user', 'name email'),

      // Monthly revenue (last 6 months)
      InventoryHistory.aggregate([
        { $match: { action: 'purchase' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 },
      ]),
    ]);

    // ── Format Monthly Revenue for chart ─────────────────────────────────────
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenue = monthlyRevenue.map((item) => ({
      month: months[item._id.month - 1],
      revenue: item.revenue,
      orders: item.orders,
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCars,
          totalStock: totalStock[0]?.total || 0,
          outOfStock,
          totalInventoryValue: totalInventoryValue[0]?.totalValue || 0,
          totalSold: totalSold[0]?.totalSold || 0,
        },
        recentCars,
        charts: {
          carsByCategory: carsByCategory.map((c) => ({ name: c._id, value: c.count })),
          carsByFuelType: carsByFuelType.map((c) => ({ name: c._id, value: c.count })),
          stockByCategory: stockTrend.map((c) => ({
            category: c._id,
            stock: c.totalStock,
            avgPrice: Math.round(c.avgPrice),
            cars: c.carCount,
          })),
          topBrands: topBrands.map((b) => ({
            brand: b._id,
            count: b.count,
            avgPrice: Math.round(b.avgPrice),
          })),
          monthlyRevenue: formattedRevenue,
        },
        recentPurchases,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
