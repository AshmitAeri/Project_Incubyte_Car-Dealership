require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('\n🚗 ═══════════════════════════════════════════════');
      console.log(`  Car Inventory API Server`);
      console.log(`  Environment : ${process.env.NODE_ENV}`);
      console.log(`  Port        : ${PORT}`);
      console.log(`  URL         : http://localhost:${PORT}/api`);
      console.log('═══════════════════════════════════════════════\n');
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled Promise Rejection
    process.on('unhandledRejection', (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Uncaught Exception
    process.on('uncaughtException', (err) => {
      console.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`❌ Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
