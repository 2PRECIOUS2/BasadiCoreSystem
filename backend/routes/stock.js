// backend/routes/stock.js
import express from 'express';
const router = express.Router(); // Initialize the router here

import { v4 as uuidv4 } from 'uuid'; // If you use uuidv4 here directly
import PDFDocument from 'pdfkit'; // Moved here
import fs from 'fs'; // Moved here

// Helper to generate invoice number
const generateInvoiceNumber = () => {
    const date = new Date();
    const datePart = date.toISOString().split('T')[0].replace(/-/g, '');
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV${datePart}-${suffix}`;
};

// The main export is a function that takes the pool
const stockRoutes = (pool) => {
    // All route definitions for this router go inside this function

    router.post('/add', async (req, res) => {
        const { stockItems, purchaseDate, totalCost } = req.body;

        const invoiceNumber = generateInvoiceNumber();

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const stockResult = await client.query(
                `INSERT INTO material_stock (invoice_number, purchase_date, total_cost, created_at)
                VALUES ($1, $2, $3, NOW()) RETURNING id`,
                [invoiceNumber, purchaseDate, totalCost]
            );
            const stockId = stockResult.rows[0].id;

            for (const item of stockItems) {
                // Ensure numeric values are parsed
                const parsedQuantity = parseInt(item.quantity);
                const parsedPriceBought = parseFloat(item.price_bought);
                const parsedUnitPrice = parseFloat(item.unit_price);

                if (isNaN(parsedQuantity) || isNaN(parsedPriceBought) || isNaN(parsedUnitPrice)) {
                    throw new Error('Invalid numeric data for stock item. Please ensure quantity, price, and unit price are numbers.');
                }

                await client.query(
                    `INSERT INTO material_stock_items
                    (stock_id, material_id, supplier_name, quantity, price_bought, unit_price)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [stockId, item.material_id, item.supplier_name, parsedQuantity, parsedPriceBought, parsedUnitPrice]
                );

                // Update material quantity & unit_price in `materials` table
                await client.query(
                    `UPDATE materials
                    SET quantity = quantity + $1,
                        unit_price = $2,
                        updated_at = NOW()
                    WHERE material_id = $3`,
                    [parsedQuantity, parsedUnitPrice, item.material_id]
                );
            }

            await client.query('COMMIT');
            res.status(201).json({ message: 'Stock added and invoice created', invoiceNumber });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error adding stock:', err.message);
            // Send a proper JSON error response
            res.status(500).json({ message: 'Error processing stock addition: ' + err.message }); // Send more detailed error
        } finally {
            client.release();
        }
    });

    // Invoice download route
    router.get('/invoice/:invoice_number/download', async (req, res) => {
        const { invoice_number } = req.params;
        const client = await pool.connect(); // Use the passed pool

        try {
            const stockRes = await client.query(
                `SELECT * FROM material_stock WHERE invoice_number = $1`, [invoice_number]
            );
            if (stockRes.rows.length === 0) return res.status(404).send('Invoice not found');

            const invoice = stockRes.rows[0];

            const itemsRes = await client.query(
                `SELECT m.material_name, i.* FROM material_stock_items i
                JOIN materials m ON i.material_id = m.material_id
                WHERE i.stock_id = $1`,
                [invoice.id]
            );

            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${invoice_number}.pdf`);
            doc.pipe(res);

            doc.fontSize(20).text(`Invoice: ${invoice_number}`, { align: 'center' });
            doc.fontSize(12).text(`Date: ${new Date(invoice.purchase_date).toLocaleDateString()}`); // Format date for PDF
            doc.moveDown();

            itemsRes.rows.forEach((item, i) => {
                doc.text(
                    `${i + 1}. ${item.material_name} - Qty: ${item.quantity} @ R${item.unit_price} = R${item.price_bought}`
                );
            });

            doc.moveDown().text(`Total Cost: R${invoice.total_cost}`, { align: 'right' });

            doc.end();
        } catch (err) {
            console.error('Error generating invoice PDF:', err);
            res.status(500).send('Error generating invoice PDF');
        } finally {
            client.release();
        }
    });

    // Fetch all invoices route
    router.get('/invoices', async (req, res) => {
        const client = await pool.connect(); // Use the passed pool
        try {
            const result = await client.query(`
                SELECT * FROM material_stock ORDER BY created_at DESC
            `);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching invoices:', err.message);
            res.status(500).json({ message: 'Failed to fetch invoices' });
        } finally {
            client.release();
        }
    });

    return router; // <-- DON'T FORGET TO RETURN THE ROUTER!
};

export default stockRoutes;