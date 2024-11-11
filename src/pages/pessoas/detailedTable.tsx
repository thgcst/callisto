import { useMemo } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";

import ApproveUserButton from "@/components/ApproveUserButton";
import Table from "@/components/Table";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";
import { formatPhoneNumber } from "@/utils/format";

import { IndividualsProps } from "./index.public";

const DetailedTable: React.FC<{
  individuals: Exclude<IndividualsProps["detailedIndividuals"], undefined>;
}> = ({ individuals }) => {
  const router = useRouter();
  const { user } = useUser();

  const columnHelper =
    createColumnHelper<
      Exclude<IndividualsProps["detailedIndividuals"], undefined>[number]
    >();

  const canReadIndividual = useMemo(
    () => user && authorization.can(user, "read:individual"),
    [user],
  );
  const canEditIndividual = useMemo(
    () => user && authorization.can(user, "edit:individual"),
    [user],
  );
  const canApproveIndividual = useMemo(
    () => user && authorization.can(user, "approve:individual"),
    [user],
  );

  const detailedColumns = useMemo(
    () => [
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
              {canApproveIndividual && !row.original.approvedByUserId ? (
                <ApproveUserButton
                  individualId={row.original.id}
                  onApprove={() => {
                    router.reload();
                  }}
                />
              ) : null}
            </div>
          );
        },
      }),
    ],
    [
      canApproveIndividual,
      canEditIndividual,
      canReadIndividual,
      columnHelper,
      router,
    ],
  );

  const table = useReactTable({
    data: individuals,
    columns: detailedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} />;
};

export default DetailedTable;
