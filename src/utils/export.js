import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(data, columns, filename) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
      // Escape commas and quotes in CSV
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}

export function exportToPDF(data, columns, filename, title) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title || filename, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  const tableColumns = columns.map(c => c.label);
  const tableRows = data.map(row =>
    columns.map(c => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
      return String(val ?? '');
    })
  );

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [46, 125, 50] },
  });

  doc.save(`${filename}.pdf`);
}
