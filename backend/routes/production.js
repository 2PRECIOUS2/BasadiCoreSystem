import express from 'express';
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
      cost_of_production // <-- Accept from frontend
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

      // 2. Calculate cost of production (prefer frontend value if provided)
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

      // 3. Insert production record
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

      // 3.5. Insert product materials if production method is 'scratch'
      if (production_method === 'scratch' && materials_used) {
        for (const material of materials_used) {
          console.log(`📝 Inserting product material: ${material.material_id} for product ${product_id}`);
          
          await client.query(`
            INSERT INTO product_materials (
              production_id, 
              product_id, 
              material_id, 
              measurement, 
              unit
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            production.production_id, 
            product_id, 
            material.material_id, 
            material.measurement, 
            material.unit || 'items'
          ]);
        }
        console.log(`✅ Inserted ${materials_used.length} product materials for product ${product_id}`);
      }

      // 4. Update product cost and quantity
      await client.query(`
        UPDATE products
        SET cost_of_production = $1, quantity = quantity + $2
        WHERE product_id = $3
      `, [costOfProduction, quantity, product_id]);

      // 5. Deduct materials from stock using FIFO (First In, First Out)
      if (production_method === 'scratch' && materials_used) {
        for (const material of materials_used) {
          const totalMaterialNeeded = material.measurement * quantity;
          let remainingToDeduct = totalMaterialNeeded;

          console.log(`🔧 Deducting ${totalMaterialNeeded} from material ${material.material_id}`);

          // Get active batches for this material, ordered by batch_number (FIFO)
          const batchesResult = await client.query(`
            SELECT id, quantity, unit_price, batch_number
            FROM material_stock_items
            WHERE material_id = $1 AND batch_status = 'active' AND quantity > 0
            ORDER BY batch_number ASC
          `, [material.material_id]);

          // Deduct from batches using FIFO
          for (const batch of batchesResult.rows) {
            if (remainingToDeduct <= 0) break;

            const deductFromThisBatch = Math.min(batch.quantity, remainingToDeduct);
            const newBatchQuantity = batch.quantity - deductFromThisBatch;

            console.log(`📦 Batch ${batch.batch_number}: Deducting ${deductFromThisBatch}, New qty: ${newBatchQuantity}`);

            // Update batch quantity
            await client.query(`
              UPDATE material_stock_items 
              SET quantity = $1
              WHERE id = $2
            `, [newBatchQuantity, batch.id]);

            // If batch is empty, mark as inactive
            if (newBatchQuantity === 0) {
              await client.query(`
                UPDATE material_stock_items 
                SET batch_status = 'inactive'
                WHERE id = $1
              `, [batch.id]);
              console.log(`🚫 Batch ${batch.batch_number} marked as inactive (empty)`);
            }

            remainingToDeduct -= deductFromThisBatch;
          }

          // Update total quantity in materials table
          const totalQtyResult = await client.query(`
            SELECT COALESCE(SUM(quantity), 0) as total_quantity
            FROM material_stock_items
            WHERE material_id = $1 AND batch_status = 'active'
          `, [material.material_id]);

          const newTotalQuantity = totalQtyResult.rows[0].total_quantity;
          await client.query(`
            UPDATE materials 
            SET quantity = $1, updated_at = NOW()
            WHERE material_id = $2
          `, [newTotalQuantity, material.material_id]);

          // Update material unit_price to match the next active batch (FIFO)
          const nextBatchResult = await client.query(`
            SELECT unit_price FROM material_stock_items
            WHERE material_id = $1 AND batch_status = 'active' AND quantity > 0
            ORDER BY batch_number ASC LIMIT 1
          `, [material.material_id]);

          if (nextBatchResult.rows.length > 0) {
            const nextUnitPrice = nextBatchResult.rows[0].unit_price;
            await client.query(`
              UPDATE materials SET unit_price = $1 WHERE material_id = $2
            `, [nextUnitPrice, material.material_id]);
            console.log(`💰 Updated unit price to ${nextUnitPrice} for material ${material.material_id}`);
          } else {
            // No active batches left, set unit_price to 0
            await client.query(`
              UPDATE materials SET unit_price = 0 WHERE material_id = $1
            `, [material.material_id]);
            console.log(`⚠️ No active batches left for material ${material.material_id}, set unit_price to 0`);
          }

          console.log(`✅ Material ${material.material_id} updated: New total quantity = ${newTotalQuantity}`);
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