// Utility for exporting tables and data sets to CSV / Excel compatible format

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>({
  filename,
  columns,
  data,
}: {
  filename: string;
  columns: CsvColumn<T>[];
  data: T[];
}) {
  if (!data || data.length === 0) {
    alert('Tidak ada data yang dapat diekspor.');
    return;
  }

  // Header row
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = col.accessor(item);
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  // BOM for Excel UTF-8 support
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
