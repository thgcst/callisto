import React from "react";

import Image from "next/image";
import Link from "next/link";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";

import Table from "@/components/Table";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useUsers } from "@/swr/users";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";

const columnsHelper =
  createColumnHelper<ReturnType<typeof useUsers>["users"][number]>();

const Page: React.FC = () => {
  const { user } = useUser();
  const { users } = useUsers();

  const canEdit = user && authorization.can(user, `edit:user`);

  const columns = [
    columnsHelper.display({
      id: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="size-10 shrink-0">
            <Image
              src={row.original.avatar}
              className="size-10 rounded-full object-cover"
              alt={row.original.name}
              width={40}
              height={40}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.original.name}
              {!row.original.activated && (
                <span
                  className={clsx(
                    "text-sm",
                    "ml-2 inline-flex rounded-full bg-yellow-100 px-2 font-medium leading-5 text-yellow-800",
                  )}
                >
                  não ativado
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    }),
    columnsHelper.accessor("_count.session", {
      header: "Sessões",
    }),
    columnsHelper.accessor("createdAt", {
      header: "Criado em",
      cell: ({ row }) => (
        <>
          <div className="text-sm font-medium text-gray-900 lg:hidden">
            {dayToDDMMYYYY(row.original.createdAt, "/")}
          </div>
          <div className="hidden text-sm font-medium text-gray-900 lg:block">
            {dayToLocaleString(row.original.createdAt)}
          </div>
        </>
      ),
    }),
    columnsHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <Link
          href={`/usuarios/${row.original.id}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          {canEdit ? "Editar" : "Ver"}
        </Link>
      ),
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} />;
};

export default Page;
