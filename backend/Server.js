require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');

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

const productionRouter = require('./routes/production');
app.use('/api/production', productionRouter(db.pool));

const serviceProviderRoutes = require('./routes/serviceProvider');
app.use('/api/service-providers', serviceProviderRoutes(db.pool));

// The materialRoutes now expects the 'pool' to be passed to it as a function argument.
const materialRoutes = require('./routes/materials');
app.use('/api/material', materialRoutes(db.pool)); // Pass the db.pool to the router factory function

const stockRoutes = require('./routes/stock');
app.use('/api/stock', stockRoutes(db.pool));

const productsRoutes = require('./routes/products');
app.use('/api/products', productsRoutes(db.pool));
// Add this line to serve static images
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images/products', express.static(path.join(__dirname, '../public/images/products')));
//app.use('/images', express.static(path.join(__dirname, '../public/images')));

const customersRoutes = require('./routes/customers');
app.use('/api/customers', customersRoutes(db.pool));
console.log('✅ Customers routes registered');

const registerRoutes = require('./routes/register');
app.use('/api/register', registerRoutes(db.pool));

const orderInvoiceRouter = require('./routes/OrderInvoice');
app.use('/api/order-invoice', orderInvoiceRouter(db.pool));

const ordersRouter = require('./routes/orders'); 
app.use('/api/orders', ordersRouter(db.pool)); // Pass the db.pool to the router factory function

const orderStatusUpdate = require('./cron/orderStatusUpdate');
orderStatusUpdate(db.pool);

const employeesRoutes = require('./routes/employess');
app.use('/api/employees', employeesRoutes(db.pool));

const projectsRouter = require('./routes/projects');
app.use('/api/projects', projectsRouter(db.pool));
//const materialBatch = require('./routes/materialBatch');
//app.use('/api/material-batch', materialBatch(db.pool));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});