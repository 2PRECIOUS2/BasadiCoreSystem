import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration with fallback for development
const dbConfig = {
  // Try connection string first
  ...(process.env.DATABASE_URL && { connectionString: process.env.DATABASE_URL }),
  
  // Fallback to individual environment variables or defaults
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'basadi_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : 'password',
  
  // SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for external DB
};

console.log('🔧 Database Configuration:');
console.log('- Host:', dbConfig.host);
console.log('- Port:', dbConfig.port);
console.log('- Database:', dbConfig.database);
console.log('- User:', dbConfig.user);
console.log('- Password provided:', !!dbConfig.password);
console.log('- SSL:', dbConfig.ssl);

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Export the pool for use in routes
export default { pool };
