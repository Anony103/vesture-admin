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
            className="px-2 text-gray-400 select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageClick(page as number)}
            className={`px-3 py-1 text-sm font-medium rounded-md border transition-all duration-200
              ${
                page === currentPage
                  ? "bg-[#7C2EBF] text-white border-[#7C2EBF]"
                  : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
              }`}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
};
