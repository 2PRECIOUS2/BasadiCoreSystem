import loginRoutes from './routes/Login.js';

console.log('🧪 Testing direct import of login routes...');
console.log('loginRoutes function:', typeof loginRoutes);

if (typeof loginRoutes === 'function') {
    console.log('✅ Login routes imported successfully');
} else {
    console.log('❌ Login routes import failed');
}

console.log('Login routes:', loginRoutes);