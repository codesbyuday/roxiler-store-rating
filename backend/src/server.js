const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = config.port;

const startServer = async () => {
  const server = app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(` Store Rating Platform Backend API Running`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${config.nodeEnv}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);

    // Log database connection status at startup without crashing if not configured
    const dbStatus = await testConnection();
    if (dbStatus.connected) {
      console.log(`[Database] Connected successfully (${dbStatus.timestamp})`);
    } else {
      console.log(`[Database] Notice: ${dbStatus.message}`);
      console.log(`[Database] Ready for configuration in Phase 2/3.`);
    }
  });

  // Graceful shutdown handling
  const handleShutdown = () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
};

startServer();
