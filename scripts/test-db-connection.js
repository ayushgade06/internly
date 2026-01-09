// Test database connection script
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

// Parse and display connection info (without password)
try {
  const url = new URL(connectionString);
  console.log('📋 Connection Details:');
  console.log('  Protocol:', url.protocol);
  console.log('  Host:', url.hostname);
  console.log('  Port:', url.port || '5432 (default)');
  console.log('  Username:', url.username);
  console.log('  Database:', url.pathname.slice(1));
  console.log('  Password:', url.password ? '***' + url.password.slice(-2) : 'not set');
  console.log('');
} catch (error) {
  console.error('❌ Invalid DATABASE_URL format:', error.message);
  process.exit(1);
}

// Test connection
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

console.log('🔄 Testing database connection...');

pool.connect()
  .then((client) => {
    console.log('✅ Connection successful!');
    return client.query('SELECT version()')
      .then((res) => {
        console.log('📊 PostgreSQL version:', res.rows[0].version.split(',')[0]);
        client.release();
        pool.end();
        process.exit(0);
      });
  })
  .catch((err) => {
    console.error('❌ Connection failed!');
    console.error('Error:', err.message);
    
    if (err.message.includes('password authentication failed')) {
      console.error('\n💡 Solution: Check your password in DATABASE_URL');
      console.error('   Make sure the password matches your PostgreSQL user password');
    } else if (err.message.includes('does not exist')) {
      console.error('\n💡 Solution: The database does not exist');
      console.error('   Create it with: CREATE DATABASE internly;');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Solution: PostgreSQL server is not running or not accessible');
      console.error('   Make sure PostgreSQL is running on the specified host and port');
    } else if (err.message.includes('role') && err.message.includes('does not exist')) {
      console.error('\n💡 Solution: The PostgreSQL user does not exist');
      console.error('   Create it with: CREATE USER username WITH PASSWORD \'password\';');
    }
    
    pool.end();
    process.exit(1);
  });
