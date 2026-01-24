module.exports = {
  apps: [{
    name: 'hal-kompleksi-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
      MONGODB_URI: 'mongodb://localhost:27017/hal-kompleksi',
      JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      EMAIL_USER: process.env.EMAIL_USER || 'destek.halkompleksi@gmail.com',
      EMAIL_PASS: process.env.EMAIL_PASS || ''
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};