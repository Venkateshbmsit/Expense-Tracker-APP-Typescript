import mysql, { Pool, PoolConnection } from 'mysql2/promise'; 

// Create a connection pool
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'expense_tracker_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection
pool.getConnection()
    .then((connection: PoolConnection) => {
        console.log('Connected to the MySQL database');
        connection.release(); // Release the connection back to the pool
    })
    .catch((err: Error) => {
        console.error('Error connecting to the database:', err); // Log full error object
    });

// Export the pool
export default pool;
