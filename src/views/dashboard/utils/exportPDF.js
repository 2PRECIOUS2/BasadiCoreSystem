// Dashboard exportPDF utility
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportPDF(data, title) {
  const doc = new jsPDF();
  doc.text(title, 14, 20);

  const columns = Object.keys(data[0] || {}).map((key) => ({ header: key, dataKey: key }));
  doc.autoTable({
    startY: 30,
    columns,
    body: data,
  });

  doc.save(`${title}.pdf`);
}