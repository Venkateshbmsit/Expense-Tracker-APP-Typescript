"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise")); // Use 'mysql2/promise' for promise-based API
// Create a connection pool
const pool = promise_1.default.createPool({
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
    .then((connection) => {
    console.log('Connected to the MySQL database');
    connection.release(); // Release the connection back to the pool
})
    .catch((err) => {
    console.error('Error connecting to the database:', err); // Log full error object
});
// Export the pool
exports.default = pool;
