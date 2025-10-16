import pool from './db/index.js';

async function testProductMaterials() {
  console.log('🧪 Testing Product Materials Storage...');
  
  const client = await pool.connect();
  
  try {
    // Test 1: Check if we have any products with recipe materials (production_id not in production table)
    console.log('\n1️⃣ Checking products with recipe materials:');
    const recipeQuery = `
      SELECT 
        p.product_name,
        pm.production_id,
        COUNT(pm.material_id) as material_count,
        CASE 
          WHEN prod.production_id IS NULL THEN 'recipe'
          ELSE 'production'
        END as source_type
      FROM products p
      LEFT JOIN product_materials pm ON p.product_id = pm.product_id
      LEFT JOIN production prod ON pm.production_id = prod.production_id
      WHERE pm.production_id IS NOT NULL
      GROUP BY p.product_id, p.product_name, pm.production_id, prod.production_id
      ORDER BY p.created_at DESC
      LIMIT 5
    `; 
        p.product_name,
        pm.production_id,
        COUNT(pm.material_id) as material_count
      FROM products p
      LEFT JOIN product_materials pm ON p.product_id = pm.product_id
      WHERE pm.production_id LIKE 'recipe-%'
      GROUP BY p.product_id, p.product_name, pm.production_id
      ORDER BY p.created_at DESC
      LIMIT 5
    `;
    
    const recipeResult = await client.query(recipeQuery);
    console.log(`Found ${recipeResult.rows.length} products with recipe materials:`);
    recipeResult.rows.forEach(row => {
      console.log(`  - ${row.product_name}: ${row.material_count} materials (${row.production_id})`);
    });

    // Test 2: Check materials table for unit prices
    console.log('\n2️⃣ Checking materials with unit prices:');
    const materialsQuery = `
      SELECT material_name, unit_price, unit, quantity, status
      FROM materials 
      WHERE status = 'active' AND unit_price > 0
      ORDER BY material_name
      LIMIT 5
    `;
    
    const materialsResult = await client.query(materialsQuery);
    console.log(`Found ${materialsResult.rows.length} active materials with prices:`);
    materialsResult.rows.forEach(row => {
      console.log(`  - ${row.material_name}: R${row.unit_price}/${row.unit} (Qty: ${row.quantity})`);
    });

    // Test 3: Check product_materials table for consistency
    console.log('\n3️⃣ Checking product_materials consistency:');
    const consistencyQuery = `
      SELECT 
        p.product_name,
        m.material_name,
        m.unit_price as current_price,
        pm.measurement,
        pm.unit,
        pm.production_id
      FROM product_materials pm
      JOIN products p ON pm.product_id = p.product_id
      JOIN materials m ON pm.material_id = m.material_id
      WHERE pm.production_id LIKE 'recipe-%'
      ORDER BY p.product_name, m.material_name
      LIMIT 10
    `;
    
    const consistencyResult = await client.query(consistencyQuery);
    console.log(`Found ${consistencyResult.rows.length} product-material relationships:`);
    consistencyResult.rows.forEach(row => {
      console.log(`  - ${row.product_name} uses ${row.measurement} ${row.unit} of ${row.material_name} @ R${row.current_price}/${row.unit}`);
    });

    // Test 4: Show any missing recipe materials
    console.log('\n4️⃣ Checking products without recipe materials:');
    const missingQuery = `
      SELECT 
        p.product_name,
        p.created_at
      FROM products p
      LEFT JOIN product_materials pm ON p.product_id = pm.product_id AND pm.production_id LIKE 'recipe-%'
      WHERE pm.product_id IS NULL AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 5
    `;
    
    const missingResult = await client.query(missingQuery);
    console.log(`Found ${missingResult.rows.length} products without recipe materials:`);
    missingResult.rows.forEach(row => {
      console.log(`  - ${row.product_name} (created: ${row.created_at})`);
    });

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    client.release();
  }
}

// Run the test
testProductMaterials().then(() => {
  console.log('\n✅ Product materials test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});