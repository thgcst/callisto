import { useMemo } from "react";

import { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";

import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Layout from "@/components/Layout";
import Table from "@/components/Table";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import individual from "@/models/individual";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";
import { formatPhoneNumber } from "@/utils/format";
import { serialize } from "@/utils/serialize";

export const getStaticProps = (async () => {
  const allIndividuals = await individual.findAll();

  return {
    props: {
      individuals: serialize(allIndividuals),
    },
  };
}) satisfies GetStaticProps;

type IndividualsProps = InferGetStaticPropsType<typeof getStaticProps>;

const columnHelper =
  createColumnHelper<IndividualsProps["individuals"][number]>();

const Individuals: React.FC<IndividualsProps> = ({ individuals }) => {
  const { user } = useUser();

  const columns = useMemo(() => {
    const authenticatedColumns: ColumnDef<(typeof individuals)[number], any>[] =
      [
        columnHelper.display({
          id: "name",
          cell: ({ row }) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {row.original.name}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(row.original.birthday).toLocaleDateString()}
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
            if (!authorization.can(user!, "read:individual")) {
              return null;
            }
            return (
              <div className="text-right">
                <Link
                  href={`/pessoas/${row.original.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {authorization.can(user!, "edit:individual")
                    ? "Editar"
                    : "Ver"}
                </Link>
              </div>
            );
          },
        }),
      ];

    const unauthenticatedColumns: ColumnDef<
      (typeof individuals)[number],
      any
    >[] = [
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
    ];

    return user && authorization.can(user, "read:individualsDetails")
      ? authenticatedColumns
      : unauthenticatedColumns;
  }, [user]);

  const table = useReactTable({
    data: individuals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Layout label="Pessoas">
      <Table table={table} />
    </Layout>
  );
};

export default Individuals;
