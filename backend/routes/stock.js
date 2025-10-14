import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import fs from 'fs';

// Helper to generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().split('T')[0].replace(/-/g, '');
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV${datePart}-${suffix}`;
};

const stockRoutes = (pool) => {

  // Add stock and generate invoice
  router.post('/add', async (req, res) => {
    const { stockItems, purchaseDate, totalCost } = req.body;
    const invoiceNumber = generateInvoiceNumber();
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Insert into material_stock table (invoice)
      const stockResult = await client.query(
        `INSERT INTO material_stock (invoice_number, purchase_date, total_cost, created_at)
         VALUES ($1, $2, $3, NOW()) RETURNING id`,
        [invoiceNumber, purchaseDate, totalCost]
      );
      const stockId = stockResult.rows[0].id;

      for (const item of stockItems) {
        const quantity = parseInt(item.quantity);
        const priceBought = parseFloat(item.price_bought);

        if (isNaN(quantity) || isNaN(priceBought)) {
          throw new Error('Invalid numeric data for stock item');
        }

        // 1. Get next batch number
        const batchNumResult = await client.query(
          `SELECT COALESCE(MAX(batch_number), 0) + 1 AS next_batch
           FROM material_stock_items
           WHERE material_id = $1`,
          [item.material_id]
        );
        const nextBatchNumber = batchNumResult.rows[0].next_batch;

        // 2. Insert into material_stock_items
        await client.query(
          `INSERT INTO material_stock_items
           (stock_id, material_id, supplier_name, quantity, price_bought, unit_price, created_at, batch_number, batch_status, purchase_date)
           VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7,'active',$8)`,
          [
            stockId,
            item.material_id,
            item.supplier_name,
            quantity,
            priceBought,
            priceBought / quantity,
            nextBatchNumber,
            purchaseDate
          ]
        );

        // 3. Update materials table: total quantity & weighted average price
        await client.query(
          `UPDATE materials
           SET quantity = (
             SELECT COALESCE(SUM(quantity),0)
             FROM material_stock_items
             WHERE material_id = $1 AND batch_status = 'active'
           ),
           unit_price = (
             SELECT COALESCE(SUM(quantity * unit_price) / NULLIF(SUM(quantity),0),0)
             FROM material_stock_items
             WHERE material_id = $1 AND batch_status = 'active'
           ),
           updated_at = NOW()
           WHERE material_id = $1`,
          [item.material_id]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ success: true, message: 'Stock added and invoice created', invoiceNumber });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding stock:', error);
      res.status(500).json({ success: false, message: error.message });
    } finally {
      if (client) client.release();
    }
  });

  // Download invoice PDF
  router.get('/invoice/:invoice_number/download', async (req, res) => {
    const { invoice_number } = req.params;
    let client;

    try {
      client = await pool.connect();
      const invoiceRes = await client.query(
        `SELECT * FROM material_stock WHERE invoice_number = $1`,
        [invoice_number]
      );
      if (invoiceRes.rows.length === 0) return res.status(404).send('Invoice not found');

      const invoice = invoiceRes.rows[0];

      const itemsRes = await client.query(
        `SELECT m.material_name, i.*
         FROM material_stock_items i
         JOIN materials m ON i.material_id = m.material_id
         WHERE i.stock_id = $1`,
        [invoice.id]
      );

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${invoice_number}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text(`Invoice: ${invoice_number}`, { align: 'center' });
      doc.fontSize(12).text(`Date: ${new Date(invoice.purchase_date).toLocaleDateString()}`);
      doc.moveDown();

      itemsRes.rows.forEach((item, idx) => {
        doc.text(`${idx + 1}. ${item.material_name} - Qty: ${item.quantity} @ R${item.unit_price.toFixed(2)} = R${item.price_bought.toFixed(2)}`);
      });

      doc.moveDown().text(`Total Cost: R${invoice.total_cost.toFixed(2)}`, { align: 'right' });
      doc.end();

    } catch (err) {
      console.error('Error generating invoice PDF:', err);
      res.status(500).send('Error generating invoice PDF');
    } finally {
      if (client) client.release();
    }
  });

  // Fetch all invoices
  router.get('/invoices', async (req, res) => {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(`SELECT * FROM material_stock ORDER BY created_at DESC`);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    } finally {
      if (client) client.release();
    }
  });

  return router;
};

export default stockRoutes;
