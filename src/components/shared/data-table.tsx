import { useState , SetStateAction , Dispatch } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  FilterFn,
  ColumnDef,
  flexRender,
  Row,
} from "@tanstack/react-table";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { ClipLoader } from "react-spinners";
import { Pagination } from "./pagination";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>; // Use any for declaration compatibility; actual filter is generic
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface Props<T> {
  data: T[] | null;
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: Error | null;
  useApiPagination?: boolean; // New prop to toggle pagination mode
  totalPages?: number; // Required for API pagination
  currentPage?: number; // Required for API pagination
  onPageChange?: (page: number ) => void; // Callback for API pagination
  pageSize?: number;
  onPageSizeChange ?: (page: number) => void;
  setPageSize : Dispatch<SetStateAction<number>>;

  pageSizeOptions ?: [10, 25, 50, 100];
}

const fuzzyFilter = <T,>(
  row: Row<T>, // Use Row<T> instead of any
  columnId: string,
  value: string,
  addMeta: (meta: { itemRank: RankingInfo }) => void
): boolean => {
  const itemValue = row.getValue(columnId);
  const safeValue =
    typeof itemValue === "string" ? itemValue : String(itemValue ?? "");
  const itemRank = rankItem(safeValue, value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export function DataTable<T>({
  data,
  columns,
  loading,
  error,
  useApiPagination = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  pageSize = 10,
  setPageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: Props<T>): JSX.Element {
  const [globalFilter, setGlobalFilter] = useState("");
  const safeData = data ?? [];

  const {
    getHeaderGroups,
    getRowModel,
    setPageIndex,
    // getCanNextPage,
    // getCanPreviousPage,
    // previousPage,
    // nextPage,
    getState,
    getPageCount,
  } = useReactTable({
    data: safeData,
    columns,
    filterFns: { fuzzy: fuzzyFilter as FilterFn<unknown> },
    state: {
      globalFilter,
      ...(useApiPagination
        ? { pagination: { pageIndex: currentPage - 1, pageSize: pageSize } }
        : {}),
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = (() => {
        const value = row.getValue(columnId);
        return typeof value === "number" ? String(value) : value ?? "";
      })() as string;
      return safeValue
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
    // Only enable client-side pagination if not using API pagination
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: useApiPagination
      ? undefined
      : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const isTableEmpty = safeData.length === 0;
  const showPagination = !loading && !error && !isTableEmpty;

  // Use API pagination values or client-side values
  const effectivePageCount = useApiPagination ? totalPages : getPageCount();
  const effectiveCurrentPage = useApiPagination
    ? currentPage
    : getState().pagination.pageIndex + 1;

  const handlePageChange = (page: number) => {
    if (useApiPagination && onPageChange) {
      onPageChange(page); // Trigger API fetch for new page
    } else {
      setPageIndex(page - 1); // Client-side page change
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (useApiPagination && onPageSizeChange) {
      onPageSizeChange(newPageSize); // Trigger API fetch with new page size
    } 
    
    else {
      setPageSize(newPageSize); // Client-side page size change
    }
  };

  return (
    <div className="grid grid-cols-1 bg-white ">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="table w-full whitespace-nowrap  border-collapse">
          <thead className="bg-white text-black border-t-2 text-xs">
            {getHeaderGroups().map((headerGroup, idx) => (
              <tr key={headerGroup.id + idx}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id + idx}
                    colSpan={header.colSpan}
                    className="text-left font-semibold last:text-center px-2 py-4 first:pl-3 last:pr-3"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6"
                  aria-live="polite"
                >
                  <div className="flex justify-center items-center gap-2">
                    <ClipLoader size={30} color="#434343" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-red-600"
                  aria-live="assertive"
                >
                  <span>
                    {error.message || "An error occurred while fetching data"}
                  </span>
                </td>
              </tr>
            ) : isTableEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-600"
                  aria-live="polite"
                >
                  No records available
                </td>
              </tr>
            ) : (
              getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id + idx}
                  className="text-xs font-light border-t-2 border-b-2"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id + idx}
                      className="text-left last:text-center px-2 py-6 last:pr-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <div className="w-auto flex flex-col md:flex-row  md:items-center gap-2 mt-4 px-2">
         
          <div className="flex md:justify-between gap-1 w-full">
            <button
              className="border rounded p-2 bg-[#434343] text-white text-sm disabled:opacity-50"
              onClick={() => handlePageChange(effectiveCurrentPage - 1)}
              disabled={effectiveCurrentPage <= 1}
            >
              {"< Prev"}
            </button>
            <Pagination
              totalPages={effectivePageCount}
              currentPage={effectiveCurrentPage}
              handlePageClick={handlePageChange}
            />
            <button
              className="border rounded p-2 bg-[#434343] text-white text-sm disabled:opacity-50"
              onClick={() => handlePageChange(effectiveCurrentPage + 1)}
              disabled={effectiveCurrentPage >= effectivePageCount}
            >
              {"Next >"}
            </button>
          </div>
           <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-700">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">per page</span>
          </div>
        </div>
      )}
    </div>
  );
}
