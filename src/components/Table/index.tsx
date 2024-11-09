import { flexRender, Table as ReactTable } from "@tanstack/react-table";

interface TableProps<TData> {
  table: ReactTable<TData>;
  loading?: boolean;
  emptyContent?: React.ReactNode;
}

function Table<TData>({
  table,
  loading = false,
  emptyContent = "Não foram encontrados dados",
}: TableProps<TData>) {
  const rowCount = loading ? 0 : table.getRowCount();
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {loading
            ? Array.from(
                { length: table.getState().pagination.pageSize },
                (_, index) => (
                  <tr key={index}>
                    {table.getFlatHeaders().map((header) => (
                      <td
                        key={header.id}
                        className="whitespace-nowrap px-6 py-4"
                      >
                        <div
                          className="h-5 w-48 rounded-md bg-gray-200"
                          style={{
                            width: `${(
                              Math.floor(Math.random() * (100 - 30 + 1)) + 30
                            ).toString()}%`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                )
              )
            : null}
          {!loading && rowCount === 0 && (
            <tr>
              <td
                className="whitespace-nowrap px-6 py-4"
                colSpan={table.getVisibleFlatColumns().length}
              >
                <div className="text-sm text-gray-500">{emptyContent}</div>
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
