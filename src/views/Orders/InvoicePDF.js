import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Optional: Add custom fonts
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Roboto', fontSize: 12 },
  section: { marginBottom: 10 },
  header: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: 'row' },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableCell: { fontSize: 12 },
});

const InvoicePDF = ({ orderData }) => {
  if (!orderData) return null;

  const { order, invoice, items } = orderData;

  // Delivery address is already an object
  const delivery = order.deliveryaddress || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.header}>Invoice #{invoice?.invoiceno || 'N/A'}</Text>
          <Text>Order Number: {order.orderno}</Text>
          <Text>Order Date: {new Date(order.createdat).toLocaleDateString()}</Text>
          <Text>Delivery Date: {new Date(order.deliverydate).toLocaleDateString()}</Text>
          <Text>Status: {order.orderstatus}</Text>
          <Text>Payment Method: {invoice?.paymentmethod || 'N/A'}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.header}>Customer</Text>
          <Text>{order.cust_fname} {order.cust_lname}</Text>
          <Text>{order.street_address}, {order.city}, {order.state_province}, {order.postal_code}, {order.country}</Text>
        </View>

        {/* Order Items Table */}
        <View style={styles.section}>
          <Text style={styles.header}>Products</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Product</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Qty</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Unit Price</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Total</Text></View>
            </View>
            {items.map(item => (
              <View style={styles.tableRow} key={item.orderitemid}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.product_name || item.productid}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{Number(item.quantity)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>R{Number(item.unitprice).toFixed(2)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>R{(Number(item.unitprice) * Number(item.quantity)).toFixed(2)}</Text></View>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text>Total Items: {Number(order.totalitems)}</Text>
          <Text>Total Amount: R{Number(order.totalamount).toFixed(2)}</Text>
          <Text>Delivery Address: {delivery.streetAddress}, {delivery.city}, {delivery.stateProvince}, {delivery.postalCode}, {delivery.country}</Text>
          <Text>Comment: {order.comment || '-'}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
