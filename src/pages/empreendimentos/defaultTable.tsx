import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Table from "@/components/Table";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";

import { CompaniesProps } from "./index.public";

const DefaultTable: React.FC<{
  companies: Exclude<CompaniesProps["companies"], undefined>;
}> = ({ companies }) => {
  const columnHelper =
    createColumnHelper<
      Exclude<CompaniesProps["companies"], undefined>[number]
    >();

  const table = useReactTable({
    data: companies,
    columns: [
      columnHelper.accessor("name", {
        header: "Nome",
      }),
      columnHelper.accessor("address.city", {
        header: "Cidade",
      }),
      columnHelper.accessor("address.state", {
        header: "Estado",
      }),
      columnHelper.accessor("createdAt", {
        header: "Criado em",
        cell: ({ getValue }) => (
          <>
            <div className="text-sm font-medium text-gray-900 lg:hidden">
              {dayToDDMMYYYY(getValue(), "/")}
            </div>
            <div className="hidden text-sm font-medium text-gray-900 lg:block">
              {dayToLocaleString(getValue())}
            </div>
          </>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} />;
};

export default DefaultTable;
