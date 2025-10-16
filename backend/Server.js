import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dbModule from './db/index.js';
import connectPgSimple from 'connect-pg-simple';




// Routes imports
import loginRoutes from './routes/Login.js';
import registerRoutes from './routes/register.js';
import approvalRoutes from './routes/approvalRoutes.js';
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

// Trust proxy for HTTPS (important on Render/Vercel)
app.set('trust proxy', process.env.TRUST_PROXY === 'true');

// ---------------------- CORS ----------------------
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow tools like Postman

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://basadicoresystem.onrender.com',
      'https://basadicoresystem-1.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    console.log('🌐 CORS Check - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin));
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------------- SESSION ----------------------
const PgSession = pgSession(session);

app.use(
  session({
    store: new PgSession({
      pool: dbModule.pool, // Use your shared PostgreSQL pool
      tableName: 'session' // Auto-created if missing
    }),
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-here-basadi-2024',
    resave: false,
    saveUninitialized: false,
    name: 'basadi.session',
    cookie: {
      secure: process.env.SECURE_COOKIES === 'true', // True for production HTTPS
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 20 * 60 * 1000 // 20 minutes
    },
    rolling: true // Refresh session expiry on every request
  })
);

// ---------------------- SESSION CHECK + LOGIN MIDDLEWARE ----------------------
function requireLogin(req, res, next) {
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

app.get('/api/check-session', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ active: false, message: 'No active session' });
  }

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

  req.session.lastActivity = now;

  res.json({
    active: true,
    user: req.session.user,
    lastActivity: req.session.lastActivity
  });
});

app.use(requireLogin);

// ---------------------- ROUTES ----------------------
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
app.use('/api/orders', ordersRouter(dbModule.pool));
app.use('/api/employees', employeesRoutes(dbModule.pool));
app.use('/api/projects', projectsRouter(dbModule.pool));
app.use('/api/timesheets', timesheetRoutes(dbModule.pool));
app.use('/api/dashboard', dashboardRouter(dbModule.pool));

// ---------------------- LOGOUT ----------------------
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('basadi.session');
    res.json({ message: 'Logged out successfully' });
  });
});

// ---------------------- STATIC FILES ----------------------
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ---------------------- CRON JOBS ----------------------
orderStatusUpdate(dbModule.pool);

// ---------------------- ROOT + DEBUG ----------------------
app.get('/', (req, res) => {
  res.json({
    message: 'BasadiCore Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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

// ---------------------- ERROR HANDLER ----------------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ---------------------- START SERVER ----------------------
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
