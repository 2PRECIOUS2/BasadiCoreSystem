import { pool } from './db/index.js';

async function testMaterialsQuery() {
  console.log('🧪 Testing Materials Query...');
  
  const client = await pool.connect();
  
  try {
    // Get a recent product ID from Jote Earrings
    console.log('\n1️⃣ Getting Jote Earrings product info:');
    const productQuery = `
      SELECT product_id, product_name, created_at
      FROM products 
      WHERE product_name LIKE '%Jote%' OR product_name LIKE '%Jot%'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const productResult = await client.query(productQuery);
    console.log('Found products:', productResult.rows);

    if (productResult.rows.length === 0) {
      console.log('❌ No Jote Earrings found');
      return;
    }

    const productId = productResult.rows[0].product_id;
    const productName = productResult.rows[0].product_name;
    
    console.log(`\n2️⃣ Testing materials endpoint query for ${productName} (${productId}):`);
    
    // Test the exact query from the endpoint
    const materialsQuery = `
      SELECT 
        pm.production_id,
        pm.product_id,
        pm.material_id,
        pm.measurement,
        pm.unit,
        m.material_name,
        m.unit_price,
        m.category as material_category,
        CASE 
          WHEN p.production_id IS NULL THEN 'recipe'
          ELSE 'production'
        END as source_type
      FROM product_materials pm
      JOIN materials m ON pm.material_id = m.material_id
      LEFT JOIN production p ON pm.production_id = p.production_id
      WHERE pm.product_id = $1
      ORDER BY 
        CASE WHEN p.production_id IS NULL THEN 0 ELSE 1 END,
        m.material_name
    `;
    
    const materialsResult = await client.query(materialsQuery, [productId]);
    console.log(`✅ Materials query returned ${materialsResult.rows.length} rows:`);
    materialsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.material_name}: ${row.measurement} ${row.unit} @ R${row.unit_price} (${row.source_type})`);
    });

    // Also check raw product_materials table
    console.log('\n3️⃣ Raw product_materials table for this product:');
    const rawQuery = `
      SELECT production_id, material_id, measurement, unit
      FROM product_materials
      WHERE product_id = $1
    `;
    
    const rawResult = await client.query(rawQuery, [productId]);
    console.log(`Found ${rawResult.rows.length} raw records:`);
    rawResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Production ID: ${row.production_id}, Material: ${row.material_id}, Amount: ${row.measurement} ${row.unit}`);
    });

    // Check if materials exist
    console.log('\n4️⃣ Check if materials exist in materials table:');
    if (rawResult.rows.length > 0) {
      const materialIds = rawResult.rows.map(r => r.material_id);
      const materialCheckQuery = `
        SELECT material_id, material_name, status
        FROM materials
        WHERE material_id = ANY($1)
      `;
      
      const materialCheckResult = await client.query(materialCheckQuery, [materialIds]);
      console.log(`Found ${materialCheckResult.rows.length} materials in materials table:`);
      materialCheckResult.rows.forEach((row) => {
        console.log(`  - ${row.material_name} (${row.material_id}) - Status: ${row.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    client.release();
  }
}

// Run the test
testMaterialsQuery().then(() => {
  console.log('\n✅ Materials query test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});