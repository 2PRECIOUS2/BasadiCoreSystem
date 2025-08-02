import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, Typography} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/stock/invoices')
      .then(res => res.json())
      .then(data => setInvoices(data));
  }, []);

   const handleView = async (invoice) => {
    const res = await fetch(`http://localhost:5000/api/stock/invoice/${invoice.invoice_number}/download`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setPdfUrl(url);
  };


  const handleClose = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice Number</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Total Cost</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map(inv => (
            <TableRow key={inv.invoice_number}>
              <TableCell>{inv.invoice_number}</TableCell>
              <TableCell>{new Date(inv.purchase_date).toLocaleDateString()}</TableCell>
              <TableCell>R{inv.total_cost}</TableCell>
              <TableCell>
                <Button onClick={() => handleView(inv)}>View</Button>
                <Button
                  href={`http://localhost:5000/api/stock/invoice/${inv.invoice_number}/download`}
                  target="_blank"
                  rel="noopener"
                >
                  Download PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

        {/* PDF Preview Dialog */}
      <Dialog open={!!pdfUrl} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Invoice PDF Preview
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Invoice PDF"
              width="100%"
              height="100%"
              style={{ border: 'none', minHeight: '75vh' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceList;