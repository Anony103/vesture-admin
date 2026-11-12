import React from "react";

type Props = {
  totalPages: number;
  currentPage: number;
  handlePageClick: (page: number) => void;
};

export const Pagination: React.FC<Props> = ({
  totalPages,
  currentPage,
  handlePageClick,
}) => {
  // Helper to generate page buttons dynamically
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // If total pages are small, show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Left ellipsis
      if (currentPage > 3) pages.push("...");

      // Dynamic middle pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Right ellipsis
      if (currentPage < totalPages - 2) pages.push("...");

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={idx}
            className="select-none px-2 text-fg3"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageClick(page as number)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`v-mono min-w-[2.25rem] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200
              ${
                page === currentPage
                  ? "border-brand/50 bg-brand/20 text-fg shadow-[0_0_0_1px_rgb(var(--brand-rgb)/0.25)]"
                  : "border-line bg-panel text-fg2 hover:border-line-hi hover:bg-panel-hi hover:text-fg"
              }`}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
};
