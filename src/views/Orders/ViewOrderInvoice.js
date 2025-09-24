// ViewOrderInvoice.js
import React, { useEffect, useState } from 'react';
import { Dialog, Box, CircularProgress, Typography } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import axios from 'axios';

const ViewOrderInvoice = ({ open, onClose, orderno }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderno) return;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/order-invoice/${orderno}`);
        const data = res.data;

        // Ensure numeric values
        const items = data.items.map(item => ({
          ...item,
          unitprice: Number(item.unitprice),
          quantity: Number(item.quantity)
        }));

        // Safe parse delivery address
        let deliveryAddress = {};
        try {
          deliveryAddress = typeof data.order.deliveryaddress === 'string'
            ? JSON.parse(data.order.deliveryaddress)
            : data.order.deliveryaddress || {};
        } catch {
          deliveryAddress = {};
        }

        setInvoiceData({ ...data, items, order: { ...data.order, deliveryaddress: deliveryAddress } });
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderno]);

  if (!invoiceData && !loading) return <p>No invoice data found.</p>;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box sx={{ p: 4 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {/* Invoice Header */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Invoice #{invoiceData.invoice?.invoiceno || '-'}
              </Typography>
              <Typography>Order Number: {invoiceData.order.orderno}</Typography>
              <Typography> Order Type: {invoiceData.order.ordertype || 'N/A'}</Typography>
              <Typography>
                Delivery Date: {new Date(invoiceData.order.deliverydate).toLocaleDateString()}
              </Typography>
              <Typography>Status: {invoiceData.order.orderstatus}</Typography>
              <Typography>Payment Method: {invoiceData.invoice?.paymentmethod || '-'}</Typography>
            </Box>

            {/* Customer Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Customer</Typography>
              <Typography>
                {invoiceData.order.cust_fname} {invoiceData.order.cust_lname}
              </Typography>
              <Typography>
                {invoiceData.order.deliveryaddress?.streetAddress}, {invoiceData.order.deliveryaddress?.city}, {invoiceData.order.deliveryaddress?.stateProvince}, {invoiceData.order.deliveryaddress?.postalCode}, {invoiceData.order.deliveryaddress?.country}
              </Typography>
            </Box>

            {/* Items Table */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Items</Typography>
              <table width="100%" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Product</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Quantity</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Unit Price</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map(item => (
                    <tr key={item.orderitemid}>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.product_name || item.productid}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.quantity}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>R{item.unitprice.toFixed(2)}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>R{(item.unitprice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* Totals */}
            <Box sx={{ mt: 2 }}>
              <Typography>Total Items: {invoiceData.order.totalitems}</Typography>
              <Typography>Total Amount: R{Number(invoiceData.order.totalamount).toFixed(2)}</Typography>
              <Typography>Comment: {invoiceData.order.comment || '-'}</Typography>
            </Box>

            {/* PDF Download */}
            <Box sx={{ mt: 3 }}>
              <PDFDownloadLink
                document={<InvoicePDF orderData={invoiceData} />}
                fileName={`Invoice_Order_${invoiceData.order.orderno}.pdf`}
                style={{
                  textDecoration: 'none',
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  borderRadius: 4
                }}
              >
                {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
              </PDFDownloadLink>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default ViewOrderInvoice;
