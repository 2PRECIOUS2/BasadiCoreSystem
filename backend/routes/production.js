import express from 'express';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

const productionRouter = (pool) => {

  // POST new production record
  router.post('/', async (req, res) => {
    const {
      product_id,
      production_method,
      quantity,
      production_date,
      materials_used,
      provider_id,
      cost_of_production
    } = req.body;

    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Validate material stock and status BEFORE any insert/update
      if (production_method === 'scratch' && materials_used) {
        for (const material of materials_used) {
          const materialCheck = await client.query(
            `SELECT quantity, status, material_name FROM materials WHERE material_id = $1`,
            [material.material_id]
          );
          const { quantity: availableQty, status, material_name } = materialCheck.rows[0];
          const totalMaterialNeeded = material.measurement * quantity;

          if (status !== 'active') {
            throw new Error(`Material "${material_name}" is archived and cannot be used.`);
          }
          if (availableQty < totalMaterialNeeded) {
            throw new Error(`Not enough stock for "${material_name}". Needed: ${totalMaterialNeeded}, Available: ${availableQty}`);
          }
        }
      }

      // 2. Calculate cost of production
      let costOfProduction = 0;
      if (typeof cost_of_production !== 'undefined' && cost_of_production !== null) {
        costOfProduction = parseFloat(cost_of_production);
      } else if (production_method === 'scratch' && materials_used) {
        costOfProduction = materials_used.reduce(
          (sum, mat) => sum + (parseFloat(mat.unit_price) * parseFloat(mat.measurement)),
          0
        );
      }
      const totalCost = costOfProduction * quantity;
      console.log('costOfProduction:', costOfProduction);
      console.log('totalCost:', totalCost);

      // 3. Insert production record ONLY
      const productionResult = await client.query(`
        INSERT INTO production (
          product_id,
          production_method,
          quantity,
          production_date,
          total_cost,
          status,
          created_at,
          provider_id,
          cost_of_production
        ) VALUES ($1, $2, $3, $4, $5, 'completed', NOW(), $6, $7)
        RETURNING *
      `, [product_id, production_method, quantity, production_date, totalCost, provider_id || null, costOfProduction]);

      const production = productionResult.rows[0];

      // ❌ REMOVED: No longer inserting into product_materials during production
      // Materials are already stored when product was created
      // We only fetch them via the /api/products/:productId/materials endpoint

      // 4. Update product cost and quantity
      await client.query(`
        UPDATE products
        SET cost_of_production = $1, quantity = quantity + $2
        WHERE product_id = $3
      `, [costOfProduction, quantity, product_id]);

      // 5. Simple material deduction from materials table only
      if (production_method === 'scratch' && materials_used) {
        for (const material of materials_used) {
          const totalMaterialNeeded = material.measurement * quantity;
          
          console.log(`🔧 Deducting ${totalMaterialNeeded} from material ${material.material_id}`);

          // Get current material quantity
          const currentMaterialResult = await client.query(`
            SELECT quantity FROM materials WHERE material_id = $1
          `, [material.material_id]);

          const currentQuantity = currentMaterialResult.rows[0].quantity;
          const newQuantity = currentQuantity - totalMaterialNeeded;

          // Simple direct update to materials table only
          await client.query(`
            UPDATE materials 
            SET quantity = $1, updated_at = NOW()
            WHERE material_id = $2
          `, [newQuantity, material.material_id]);

          console.log(`✅ Material ${material.material_id} updated: ${currentQuantity} -> ${newQuantity}`);
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Production record created successfully',
        data: production
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating production record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create production record',
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  });
  return router;
};

export default productionRouter;