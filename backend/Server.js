import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dbModule from './db/index.js';

// Routes imports
import loginRoutes from './routes/Login.js';
import registerRoutes from './routes/register.js';
import approvalRoutes from './routes/approvalRoutes.js';
// import { sessionTimeout } from './middlewares/sessionTimeout.js'; // COMMENTED OUT - causing random logouts
import projectsRouter from './routes/projects.js';
import employeesRoutes from './routes/employess.js';
import materialRoutes from './routes/materials.js';
import productsRoutes from './routes/products.js';
import stockRoutes from './routes/stock.js';
import customersRoutes from './routes/customers.js';
import orderInvoiceRouter from './routes/OrderInvoice.js';
import ordersRouter from './routes/orders.js';
import serviceProviderRoutes from './routes/serviceProvider.js';
import timesheetRoutes from './routes/Timesheet.js';
import productionRouter from './routes/production.js';
import dashboardRouter from './routes/dashboard.js';
import orderStatusUpdate from './cron/orderStatusUpdate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

// Trust proxy for production deployment
app.set('trust proxy', 1);

// CORS configuration - MUST specify exact origin when using credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174', // Add this for your current dev server
      'http://localhost:3000',
      'https://basadicoresystem-1.onrender.com',
      'https://basadicoresystem.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('🌐 CORS Check - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin));
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(null, true); // Allow for debugging - change back in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Session configuration
// Replace the session configuration section with this unified approach:

// Session configuration - 20 minute timeout
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-here-basadi-2024',
  resave: false,
  saveUninitialized: false,
  name: 'basadi.session',
  cookie: {
    secure: isProduction, // cookies sent only over HTTPS in production
    httpOnly: true,
    maxAge: 20 * 60 * 1000, // 20 minutes in milliseconds
    sameSite: isProduction ? 'none' : 'lax' // allow cross-site cookies in production
  },
  rolling: true // Reset expiration on each request
}));
// Update the requireLogin middleware to use 20-minute timeout
function requireLogin(req, res, next) {
  // Allow login and register routes without session
  if (
    req.path.startsWith('/api/login') ||
    req.path.startsWith('/api/register') ||
    req.path === '/' ||
    req.path.startsWith('/images') ||
    req.path === '/api/check-session'
  ) {
    return next();
  }
  
  if (!req.session.user) {
    return res.status(401).json({ 
      message: 'Session expired or not logged in. Please login.',
      code: 'NO_SESSION'
    });
  }
  
  // Check last activity - 20 minutes timeout
  const now = Date.now();
  const TWENTY_MINUTES = 20 * 60 * 1000;
  
  if (req.session.lastActivity && now - req.session.lastActivity > TWENTY_MINUTES) {
    req.session.destroy(() => {
      return res.status(401).json({ 
        message: 'Session timed out after 20 minutes of inactivity. Please login again.',
        code: 'SESSION_TIMEOUT'
      });
    });
    return;
  }
  
  req.session.lastActivity = now;
  next();
}

// Update the check-session route to use 20-minute timeout
app.get('/api/check-session', (req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({ 
            active: false, 
            message: 'No active session' 
        });
    }

    // Check if session is expired (20 minutes of inactivity)
    const TWENTY_MINUTES = 20 * 60 * 1000;
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;
    const inactiveDuration = now - lastActivity;

    if (inactiveDuration > TWENTY_MINUTES) {
        req.session.destroy((err) => {
            if (err) console.error('Session destroy error:', err);
        });
        return res.status(440).json({ 
            active: false, 
            message: 'Session expired due to 20 minutes of inactivity' 
        });
    }

    // Update last activity
    req.session.lastActivity = now;

    res.json({ 
        active: true, 
        user: req.session.user,
        lastActivity: req.session.lastActivity 
    });
});

app.use(requireLogin);

// ---------------------- Routes ----------------------
app.use('/api/login', loginRoutes(dbModule.pool));
app.use('/api/register', registerRoutes(dbModule.pool));
app.use('/api/approval', approvalRoutes);
app.use('/api/production', productionRouter(dbModule.pool));
app.use('/api/service-providers', serviceProviderRoutes(dbModule.pool));
app.use('/api/material', materialRoutes(dbModule.pool));
app.use('/api/stock', stockRoutes(dbModule.pool));
app.use('/api/products', productsRoutes(dbModule.pool));
app.use('/api/customers', customersRoutes(dbModule.pool));
app.use('/api/order-invoice', orderInvoiceRouter(dbModule.pool));

app.use('/api/order-invoice', orderInvoiceRouter(dbModule.pool));
app.use('/api/orders', ordersRouter(dbModule.pool));
app.use('/api/employees', employeesRoutes(dbModule.pool));
app.use('/api/projects', projectsRouter(dbModule.pool));
app.use('/api/timesheets', timesheetRoutes(dbModule.pool));
app.use('/api/dashboard', dashboardRouter(dbModule.pool));


// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Failed to logout' });
        }
        res.clearCookie('basadi.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// ---------------------- Static files ----------------------
// Serve images from the public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ---------------------- Cron jobs ----------------------
orderStatusUpdate(dbModule.pool);

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'BasadiCore Backend API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug session route
app.get('/api/session-check', (req, res) => {
  res.json({
    hasSession: !!req.session.user,
    sessionId: req.sessionID,
    user: req.session.user || null,
    lastActivity: req.session.lastActivity || null,
    cookies: req.headers.cookie || 'No cookies',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
