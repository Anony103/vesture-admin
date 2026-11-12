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
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
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
  /** draw the table as its own bordered card; leave off when the table already sits edge to edge in a card */
  boxed?: boolean;
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
  boxed = false,
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
    <div className="grid grid-cols-1">
      <div className={boxed ? "v-table-boxed" : "v-table-wrap"}>
        <div className="v-table-scroll">
          <table className="v-table">
            <thead>
              {getHeaderGroups().map((headerGroup, idx) => (
                <tr key={headerGroup.id + idx}>
                  {headerGroup.headers.map((header, idx) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id + idx}
                        colSpan={header.colSpan}
                        aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                        className="last:text-center first:pl-4 last:pr-4"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "inline-flex cursor-pointer select-none items-center gap-1 hover:text-fg"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {sorted === "asc" ? (
                              <ChevronUp size={13} className="text-brand" />
                            ) : sorted === "desc" ? (
                              <ChevronDown size={13} className="text-brand" />
                            ) : null}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-10 text-center text-fg2"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <ClipLoader size={22} color="rgb(164, 92, 255)" />
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-10 text-center text-danger"
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
                    className="py-10 text-center text-fg3"
                    aria-live="polite"
                  >
                    No records available
                  </td>
                </tr>
              ) : (
                getRowModel().rows.map((row, idx) => (
                  <tr key={row.id + idx}>
                    {row.getVisibleCells().map((cell, idx) => (
                      <td
                        key={cell.id + idx}
                        className="text-left first:pl-4 last:pr-4 last:text-center"
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
      </div>
      {showPagination && (
        <div className={`flex w-auto flex-col gap-3 md:flex-row md:items-center ${boxed ? "mt-4 px-1" : "border-t border-line px-4 py-4"}`}>
          <div className="flex w-full items-center justify-between gap-2">
            <button
              className="v-btn v-btn-ghost"
              onClick={() => handlePageChange(effectiveCurrentPage - 1)}
              disabled={effectiveCurrentPage <= 1}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <Pagination
              totalPages={effectivePageCount}
              currentPage={effectiveCurrentPage}
              handlePageClick={handlePageChange}
            />
            <button
              className="v-btn v-btn-ghost"
              onClick={() => handlePageChange(effectiveCurrentPage + 1)}
              disabled={effectiveCurrentPage >= effectivePageCount}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-fg2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-9 rounded-lg border border-line-hi bg-field px-2 text-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        </div>
      )}
    </div>
  );
}
