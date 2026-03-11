import { useState } from "react";
// import {
//   Select,
//   SelectValue,
//   SelectTrigger,
//   SelectContent,
//   SelectLabel,
//   SelectItem,
//   SelectGroup,
// } from "../ui/select";
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
} from "@tanstack/react-table";

import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { User } from "../../types/table-type";

// import { DebouncedInput } from ".";
import { Pagination } from "./pagination";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, User>[];
  // handleDownload?: () => Promise<void>;
}

/* eslint-disable */
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};
/* eslint-enable */

export function AssetDataTable<T>({
  data,
  columns,

}: Props<T>): JSX.Element {
  const [globalFilter, setGlobalFilter] = useState("");
  const {
    getHeaderGroups,
    getRowModel,
    setPageIndex,
    getCanNextPage,
    getCanPreviousPage,
    previousPage,
    nextPage,
    getState,
    getPageCount,
    // setPageSize,
  } = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = (() => {
        const value = row.getValue(columnId);
        return typeof value === "number" ? String(value) : value;
      })() as string;

      return safeValue?.toLowerCase().includes(filterValue.toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div className="grid grid-cols-1 bg-white overflow-auto">
      <div className="">
        <table className="table w-full whitespace-nowrap ">
          <thead className="bg-white text-black text-xs ">
            {getHeaderGroups()?.map((headerGroup, idx) => (
              <tr key={headerGroup.id + idx} className="">
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <th
                      key={header.id + idx}
                      colSpan={header.colSpan}
                      className="text-left font-semibold last:text-center px-2 py-4 first:pl-3 last:pr-3 "
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none "
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
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {getRowModel()?.rows?.map((row, idx) => {
              return (
                <tr key={row.id + idx} className="text-xs font-light border-t-2 border-b-2 ">
                  {row.getVisibleCells().map((cell, idx) => {
                    return (
                      <td
                        key={cell.id + idx}
                        className={`text-left  last:text-center  px-2 py-6 last:pr-3`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-4 px-2">
        <div className="flex  md:justify-between gap-1 w-full">
          <button
            className="border rounded p-2 bg-[#434343] text-white text-sm"
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
          >
            {"< Prev"}
          </button>
          <Pagination
            totalPages={getPageCount()}
            currentPage={getState().pagination.pageIndex + 1}
            handlePageClick={(page: number) => setPageIndex(page - 1)}
          />
          <button
            className="border rounded p-2 bg-[#434343] text-white text-sm"
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
          >
            {"Next >"}
          </button>
        </div>
        {/* <div className="max-w-[100px] w-full">
          <Select
            value={getState().pagination.pageSize.toString()}
            onValueChange={async (value) => {
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Account</SelectLabel>
                {[5, 10, 20, 30, 40, 50].map((num) => (
                  <SelectItem value={num.toString()} key={num}>
                    {num}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}
      </div>
    </div>
  );
}
