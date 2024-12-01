import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type PaginationProps = {
  totalRows: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
};

const generatePagination = (currentPage: number, totalPages: number) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    const startPage = Math.max(currentPage - 1, 1);
    const endPage = Math.min(currentPage + 1, totalPages);

    if (startPage > 1) pageNumbers.push(1);

    if (startPage > 2) pageNumbers.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) pageNumbers.push("...");

    if (endPage < totalPages) pageNumbers.push(totalPages);
  }

  return pageNumbers;
};

const Pagination: React.FC<PaginationProps> = ({
  totalRows,
  page,
  rowsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const handleNextPage = () => {
    onPageChange(page + 1);
  };

  const handlePreviousPage = () => {
    onPageChange(page - 1);
  };

  const pageNumberList = generatePagination(page, totalPages);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          disabled={!hasPreviousPage}
          onClick={handlePreviousPage}
          className={clsx(
            "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700",
            hasPreviousPage ? "hover:bg-gray-50" : "cursor-not-allowed",
          )}
        >
          Anterior
        </button>
        <button
          disabled={!hasNextPage}
          onClick={handleNextPage}
          className={clsx(
            "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700",
            hasNextPage ? "hover:bg-gray-50" : "cursor-not-allowed",
          )}
        >
          Próximo
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{" "}
            <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(page * rowsPerPage, totalRows)}
            </span>{" "}
            de <span className="font-medium">{totalRows}</span> resultados
          </p>
        </div>
        <div>
          <nav
            aria-label="Paginação"
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          >
            <button
              disabled={!hasPreviousPage}
              onClick={handlePreviousPage}
              className={clsx(
                "relative inline-flex items-center rounded-l-md p-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                hasPreviousPage ? "hover:bg-gray-50" : "cursor-not-allowed",
              )}
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            {pageNumberList.map((pageNumber) => (
              <button
                key={pageNumber}
                disabled={pageNumber === "..." || pageNumber === page}
                onClick={() => {
                  if (typeof pageNumber === "number") {
                    onPageChange(pageNumber);
                  }
                }}
                className={clsx(
                  pageNumber === page
                    ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-20 focus:outline-offset-0",
                  !(pageNumber === "..." || pageNumber === page) &&
                    "hover:bg-gray-50",
                )}
              >
                {pageNumber}
              </button>
            ))}
            <button
              disabled={!hasNextPage}
              onClick={handleNextPage}
              className={clsx(
                "relative inline-flex items-center rounded-r-md p-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                hasNextPage ? "hover:bg-gray-50" : "cursor-not-allowed",
              )}
            >
              <span className="sr-only">Próximo</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
