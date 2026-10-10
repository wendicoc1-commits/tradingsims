import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportHoldingItem {
  symbol: string;
  displaySymbol: string;
  name: string;
  avgPrice: number;
  currentPrice: number;
  lots: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

export interface ExportOrderItem {
  id: string;
  symbol: string;
  type: string;
  orderType: string;
  price: number;
  lots: number;
  total: number;
  status: string;
  createdAt: string;
}

/**
 * Ekspor data riwayat transaksi dan portofolio ke file Excel (.xlsx)
 */
export function exportPortfolioToExcel(
  holdings: ExportHoldingItem[],
  orders: ExportOrderItem[],
  cashBalance: number,
  userName = 'Fincept Trader'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Portofolio
  const holdingsData = holdings.map((h, i) => ({
    No: i + 1,
    Simbol: h.displaySymbol || h.symbol,
    'Nama Emiten': h.name,
    'Volume (Lot/Unit)': h.lots,
    'Harga Rata-rata': h.avgPrice,
    'Harga Pasar': h.currentPrice,
    'Nilai Investasi (Rp)': h.avgPrice * h.lots * (h.symbol.includes('-USD') ? 1 : 100),
    'Floating P/L (Rp)': h.unrealizedPL,
    'Floating P/L (%)': `${h.unrealizedPLPercent.toFixed(2)}%`,
  }));

  const holdingsWs = XLSX.utils.json_to_sheet(holdingsData);
  XLSX.utils.book_append_sheet(wb, holdingsWs, 'Portofolio Aktif');

  // Sheet 2: Riwayat Order
  const ordersData = orders.map((o, i) => ({
    No: i + 1,
    ID: o.id,
    Waktu: o.createdAt,
    Simbol: o.symbol,
    Aksi: o.type,
    Tipe: o.orderType,
    Harga: o.price,
    'Volume (Lot/Unit)': o.lots,
    'Total Transaksi': o.total,
    Status: o.status,
  }));

  const ordersWs = XLSX.utils.json_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(wb, ordersWs, 'Riwayat Order');

  // Unduh File
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Fincept_Portfolio_Report_${dateStr}.xlsx`);
}

/**
 * Ekspor elemen HTML (misal kartu performa / sertifikat) ke PDF resmi
 */
export async function exportElementToPDF(
  elementId: string,
  fileName = 'Fincept_Trading_Report.pdf'
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dengan ID #${elementId} tidak ditemukan.`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0d0e12',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}
