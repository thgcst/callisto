import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Table from "@/components/Table";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";

import { IndividualsProps } from "./index.public";

const DefaultTable: React.FC<{
  individuals: Exclude<IndividualsProps["individuals"], undefined>;
}> = ({ individuals }) => {
  const columnHelper =
    createColumnHelper<
      Exclude<IndividualsProps["individuals"], undefined>[number]
    >();

  const table = useReactTable({
    data: individuals,
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
