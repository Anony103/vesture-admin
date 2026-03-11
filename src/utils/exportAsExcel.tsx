import * as XLSX from "xlsx";

type ExportValue = string | number | boolean | Date | null | undefined;

type ExportColumn<T> = {
  header: string;
  key: keyof T | ((row: T, index: number) => ExportValue);
};

interface ExportToExcelProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  fileName: string;
  sheetName?: string;
}

export function exportToExcel<T>({
  data,
  columns,
  fileName,
  sheetName = "Sheet1",
}: ExportToExcelProps<T>) {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  const formattedData: Record<string, ExportValue>[] = data.map(
    (row, index) => {
      const result: Record<string, ExportValue> = {};

      columns.forEach((col) => {
        result[col.header] =
          typeof col.key === "function"
            ? col.key(row, index)
            : (row[col.key] as ExportValue);
      });

      return result;
    }
  );

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
