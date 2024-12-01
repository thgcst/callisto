import { useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import {
  createColumnHelper,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";

import ApproveIndividualsButton from "@/components/ApproveIndividualButton/multiple";
import Checkbox from "@/components/Checkbox";
import Table from "@/components/Table";
import { useQueryPagination } from "@/components/Table/useQueryPagination";
import Tabs, { Tab } from "@/components/Tabs";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";
import { formatPhoneNumber } from "@/utils/format";

import { IndividualsProps } from "./index.public";

interface DetailedTableProps {
  individuals: Exclude<IndividualsProps["detailedIndividuals"], undefined>[0];
  meta: Exclude<IndividualsProps["detailedIndividuals"], undefined>[1];
}
const DetailedTable: React.FC<DetailedTableProps> = ({ individuals, meta }) => {
  const { pagination, onPaginationChange } = useQueryPagination(meta);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { query, replace, asPath } = useRouter();
  const tab = (query.tab ?? "aprovados") as "pendente" | "aprovados";
  const { user } = useUser();

  const columnHelper = createColumnHelper<(typeof individuals)[number]>();

  const canReadIndividual = useMemo(
    () => user && authorization.can(user, "read:individual"),
    [user],
  );
  const canEditIndividual = useMemo(
    () => user && authorization.can(user, "edit:individual"),
    [user],
  );

  const detailedColumns = useMemo(
    () => [
      columnHelper.display({
        id: "checkbox",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.toggleAllRowsSelected}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.toggleSelected}
          />
        ),
      }),
      columnHelper.display({
        id: "name",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {row.original.name}
            </p>
            <p className="text-sm text-gray-500">
              {format(new Date(row.original.birthday), "dd/MM/yyyy")}
            </p>
          </div>
        ),
        header: "Nome",
      }),
      columnHelper.display({
        id: "contact",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {row.original.email}
            </p>
            {row.original.phoneNumber ? (
              <p className="text-sm text-gray-500">
                {formatPhoneNumber(row.original.phoneNumber)}
              </p>
            ) : null}
          </div>
        ),
        header: "Contato",
      }),
      columnHelper.accessor("address", {
        header: "Endereço",
        cell: ({ getValue }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {getValue().street}, {getValue().number}
              {getValue().complement ? ` - ${getValue().complement}` : ""}
            </p>
            <p className="text-sm text-gray-900">
              {getValue().city} - {getValue().state}
            </p>
            <p className="text-sm text-gray-500">{getValue().cep}</p>
          </div>
        ),
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
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          if (!canReadIndividual) {
            return null;
          }
          return (
            <div className="flex items-center gap-4">
              <Link
                href={`/pessoas/${row.original.id}`}
                className="text-indigo-600 hover:text-indigo-900"
              >
                {canEditIndividual ? "Editar" : "Ver"}
              </Link>
            </div>
          );
        },
      }),
    ],
    [canEditIndividual, canReadIndividual, columnHelper],
  );

  const table = useReactTable({
    data: individuals,
    columns:
      tab === "aprovados"
        ? detailedColumns.filter((column) => column.id !== "checkbox")
        : detailedColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    onPaginationChange,
    pageCount: meta.pageCount,
    rowCount: meta.totalCount,
    state: {
      pagination,
      rowSelection,
    },
  });

  return (
    <Tabs
      onChange={(e) => {
        const newTab = ["pendente", "aprovados"][e];
        replace({
          query: { tab: newTab },
        });
      }}
      defaultIndex={tab === "pendente" ? 0 : 1}
      rightSection={(t) =>
        t === "Pendentes" && (
          <ApproveIndividualsButton
            size="sm"
            individualIds={Object.entries(rowSelection)
              .filter(([, selected]) => selected)
              .map(([individualId]) => individualId)}
            onApprove={() => {
              setRowSelection({});
              replace(asPath);
            }}
          />
        )
      }
    >
      <Tab label="Pendentes">
        <Table table={table} pagination />
      </Tab>
      <Tab label="Aprovados">
        <Table table={table} pagination />
      </Tab>
    </Tabs>
  );
};

export default DetailedTable;
