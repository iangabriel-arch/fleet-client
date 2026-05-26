import jsPDF from 'jspdf';

export const generateReceipt = (payment, customer) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── HEADER ───────────────────────────────────────────────
  // Gold header bar
  doc.setFillColor(200, 169, 110);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Company name
  doc.setTextColor(5, 8, 22);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FLEETOS', 15, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise Fleet Management System', 15, 26);

  // Receipt label on right
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', pageWidth - 15, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.receiptNumber || '—', pageWidth - 15, 26, { align: 'right' });

  // ─── RECEIPT INFO ─────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);

  const infoY = 50;
  // Left — customer info
  doc.setFont('helvetica', 'bold');
  doc.text('Received From:', 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const customerName = customer?.fullName ||
    `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || '—';

  doc.text(customerName,              15, infoY + 7);
  doc.text(customer?.phone   || '—', 15, infoY + 14);
  doc.text(customer?.email   || '—', 15, infoY + 21);
  doc.text(customer?.nationalId || '—', 15, infoY + 28);

  // Right — payment info
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details:', pageWidth / 2, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const payDate = payment.createdAt
    ? new Date(payment.createdAt).toLocaleDateString('en-KE', { day:'2-digit', month:'long', year:'numeric' })
    : new Date().toLocaleDateString('en-KE', { day:'2-digit', month:'long', year:'numeric' });

  doc.text(`Date: ${payDate}`,                                        pageWidth / 2, infoY + 7);
  doc.text(`Method: ${payment.method?.replace(/_/g,' ').toUpperCase() || '—'}`, pageWidth / 2, infoY + 14);
  doc.text(`Type: ${payment.type?.replace(/_/g,' ').toUpperCase() || '—'}`,     pageWidth / 2, infoY + 21);
  doc.text(`Status: ${payment.status?.toUpperCase() || 'COMPLETED'}`,            pageWidth / 2, infoY + 28);

  // ─── DIVIDER ──────────────────────────────────────────────
  doc.setDrawColor(200, 169, 110);
  doc.setLineWidth(0.5);
  doc.line(15, infoY + 38, pageWidth - 15, infoY + 38);

  // ─── AMOUNT TABLE ─────────────────────────────────────────
  const tableY = infoY + 48;

  doc.setFillColor(245, 245, 245);
  doc.rect(15, tableY, pageWidth - 30, 10, 'F');

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description',  20,            tableY + 7);
  doc.text('Amount (KES)', pageWidth - 20, tableY + 7, { align: 'right' });

  // Row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const desc = payment.type?.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Payment';
  doc.text(desc, 20, tableY + 20);
  doc.text(Number(payment.amount).toLocaleString(), pageWidth - 20, tableY + 20, { align: 'right' });

  // Total row
  doc.setDrawColor(200, 169, 110);
  doc.line(15, tableY + 28, pageWidth - 15, tableY + 28);

  doc.setFillColor(200, 169, 110);
  doc.rect(15, tableY + 28, pageWidth - 30, 12, 'F');

  doc.setTextColor(5, 8, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL PAID', 20, tableY + 37);
  doc.text(
    `KES ${Number(payment.amount).toLocaleString()}`,
    pageWidth - 20,
    tableY + 37,
    { align: 'right' }
  );

  // ─── REFERENCE ────────────────────────────────────────────
  if (payment.reference) {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Reference: ${payment.reference}`, 15, tableY + 55);
  }

  // ─── NOTES ────────────────────────────────────────────────
  if (payment.notes) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Notes: ${payment.notes}`, 15, tableY + 65);
  }

  // ─── FOOTER ───────────────────────────────────────────────
  const footerY = 265;

  doc.setDrawColor(200, 169, 110);
  doc.setLineWidth(0.3);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated receipt and does not require a physical signature.', pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text('FleetOS Enterprise Fleet Management System', pageWidth / 2, footerY + 13, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString('en-KE')}`, pageWidth / 2, footerY + 19, { align: 'center' });

  // ─── WATERMARK (paid stamp) ───────────────────────────────
  doc.setTextColor(200, 169, 110);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.text('PAID', pageWidth / 2, 180, { align: 'center', angle: 35 });
  doc.setGState(doc.GState({ opacity: 1 }));

  // ─── SAVE ─────────────────────────────────────────────────
  const filename = `FleetOS-Receipt-${payment.receiptNumber || Date.now()}.pdf`;
  doc.save(filename);
};
