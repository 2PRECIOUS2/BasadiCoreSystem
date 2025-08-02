require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');

// --- Import the CENTRALIZED database module ---
const db = require('./db'); // This imports the `module.exports` from backend/db/index.js

const app = express();
const port = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());

// --- Registering Routes ---
const approvalRoutes = require('./routes/approvalRoutes');
app.use('/api/approval', approvalRoutes);


// The materialRoutes now expects the 'pool' to be passed to it as a function argument.
const materialRoutes = require('./routes/materials');
app.use('/api/material', materialRoutes(db.pool)); // Pass the db.pool to the router factory function

const stockRoutes = require('./routes/stock');
app.use('/api/stock', stockRoutes(db.pool));

const productsRoutes = require('./routes/products');
const path = require('path');
app.use('/api/products', productsRoutes);
app.use('/images/products', express.static(path.join(__dirname, '../public/images/products')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));


// User Registration Route - Using `db.pool.connect()`
app.post('/api/register', async (req, res) => {
  // ... (your existing registration logic) ...
  let client;
  try {
    client = await db.pool.connect(); // Access the pool from the imported `db` object
    // ... rest of your registration query using 'client' ...
  } catch (error) {
    // ...
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Admin Approval Route - Using `db.pool.connect()`
app.get('/api/approve-user', async (req, res) => {
  // ... (your existing approval logic) ...
  let client;
  try {
    client = await db.pool.connect(); // Access the pool from the imported `db` object
    // ... rest of your approval query using 'client' ...
  } catch (error) {
    // ...
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});