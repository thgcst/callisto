import { ChangeEvent, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useDebounceCallback } from "usehooks-ts";

import ApproveCompaniesButton from "@/components/ApproveCompanyButton/multiple";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Table from "@/components/Table";
import { useQueryPagination } from "@/components/Table/useQueryPagination";
import Tabs, { Tab } from "@/components/Tabs";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";
import { formatCnpj, formatPhoneNumber } from "@/utils/format";

import { CompaniesProps } from "./index.public";

interface DetailedTableProps {
  companies: Exclude<CompaniesProps["detailedCompanies"], undefined>[0];
  meta: Exclude<CompaniesProps["detailedCompanies"], undefined>[1];
}

const DetailedTable: React.FC<DetailedTableProps> = ({ companies, meta }) => {
  const { pagination, onPaginationChange } = useQueryPagination(meta);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { query, replace, asPath } = useRouter();
  const tab = (query.tab ?? "aprovados") as "pendente" | "aprovados";
  const { user } = useUser();

  const columnHelper = createColumnHelper<(typeof companies)[number]>();

  const canReadCompany = useMemo(
    () => user && authorization.can(user, "read:company"),
    [user],
  );
  const canEditCompany = useMemo(
    () => user && authorization.can(user, "edit:company"),
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
            <p className="text-sm text-gray-500">{row.original.fantasyName}</p>
            {row.original.cnpj ? (
              <p className="text-sm text-gray-500">
                {formatCnpj(row.original.cnpj)}
              </p>
            ) : null}
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
      columnHelper.accessor("formalized", {
        header: "Formalizado",
        cell: ({ getValue }) =>
          getValue() ? (
            <CheckCircleIcon
              className="size-8 text-green-500"
              accentHeight={24}
            />
          ) : (
            <XCircleIcon className="size-8 text-red-500" />
          ),
      }),
      columnHelper.accessor("_count.employees", {
        header: "Nº de Funcionários",
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
          if (!canReadCompany) {
            return null;
          }
          return (
            <div className="flex items-center gap-4">
              <Link
                href={`/empreendimentos/${row.original.id}`}
                className="text-indigo-600 hover:text-indigo-900"
              >
                {canEditCompany ? "Editar" : "Ver"}
              </Link>
            </div>
          );
        },
      }),
    ],
    [canEditCompany, canReadCompany, columnHelper],
  );

  const table = useReactTable({
    data: companies,
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

  const onSearchChange = useDebounceCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        delete query.search;
        return replace({ query });
      }

      replace({ query: { ...query, search: e.target.value || undefined } });
    },
    500,
  );

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
          <ApproveCompaniesButton
            size="sm"
            companyIds={Object.entries(rowSelection)
              .filter(([, selected]) => selected)
              .map(([companyId]) => companyId)}
            onApprove={() => {
              setRowSelection({});
              replace(asPath);
            }}
          />
        )
      }
    >
      <Tab label="Pendentes">
        <div className="space-y-4">
          <div className="max-w-80">
            <Input
              placeholder="Busca"
              onChange={onSearchChange}
              defaultValue={query.search}
            />
          </div>
          <Table table={table} pagination />
        </div>
      </Tab>
      <Tab label="Aprovados">
        <div className="space-y-4">
          <div className="max-w-80">
            <Input
              placeholder="Busca"
              onChange={onSearchChange}
              defaultValue={query.search}
            />
          </div>
          <Table table={table} pagination />
        </div>
      </Tab>
    </Tabs>
  );
};

export default DetailedTable;
