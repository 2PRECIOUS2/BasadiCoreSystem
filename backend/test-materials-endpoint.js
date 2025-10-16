// Quick test to check materials endpoint
const productId = 'c884f424-b22c-4904-9e5a-a0863421e1d8'; // Replace with your actual product ID

console.log('Testing materials endpoint for product:', productId);

fetch(`http://localhost:5000/api/products/${productId}/materials`, {
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('✅ API Response:', data);
  if (data.success && data.data.length > 0) {
    console.log('📦 Materials found:');
    data.data.forEach(mat => {
      console.log(`  - ${mat.material_name}: ${mat.measurement} ${mat.unit} @ R${mat.unit_price}`);
    });
  } else {
    console.log('❌ No materials found or API error');
  }
})
.catch(error => {
  console.error('❌ Fetch error:', error);
});