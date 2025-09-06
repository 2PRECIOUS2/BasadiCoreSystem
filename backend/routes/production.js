const express = require('express');
const { route } = require('./approvalRoutes');
const router = express.Router();

module.exports = (pool) => {

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

      // 4. Update product cost and quantity
      await client.query(`
        UPDATE products
        SET cost_of_production = $1, quantity = quantity + $2
        WHERE product_id = $3
      `, [costOfProduction, quantity, product_id]);

      // 5. Deduct materials from stock and sync unit price to active batch
      if (production_method === 'scratch' && materials_used) {
        for (const material of materials_used) {
          const totalMaterialNeeded = material.measurement * quantity;
          await client.query(`
            UPDATE materials
            SET quantity = quantity - $1
            WHERE material_id = $2
          `, [totalMaterialNeeded, material.material_id]);

          // FIFO batch sync: update materials.unit_price to match active batch
          const nextBatchResult = await client.query(
            `SELECT unit_price FROM material_stock_items
             WHERE material_id = $1 AND batch_status = 'active'
             ORDER BY batch_number ASC LIMIT 1`,
            [material.material_id]
          );
          if (nextBatchResult.rows.length > 0) {
            const nextUnitPrice = nextBatchResult.rows[0].unit_price;
            await client.query(
              `UPDATE materials SET unit_price = $1 WHERE material_id = $2`,
              [nextUnitPrice, material.material_id]
            );
          }
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
  return route;
};