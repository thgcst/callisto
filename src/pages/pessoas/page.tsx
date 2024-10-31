import React, { useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

import clsx from "clsx";

import ApproveUserButton from "@/components/ApproveUserButton";
import authorization from "@/models/authorization";
import { useMe, useUsers } from "@/swr/users";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";
import { formatCpf, formatPhoneNumber } from "@/utils/format";

const Page: React.FC = () => {
  const { me } = useMe();
  const { users: notApprovedUsers } = useUsers({ approved: false });
  const { users: approvedUsers } = useUsers({ approved: true });

  const canEdit = me && authorization.roleIsAdmin(me);

  const dataset = useMemo(() => {
    const list = [];

    if (notApprovedUsers.length > 0) {
      list.push({
        title: "Não aprovados",
        users: notApprovedUsers,
      });
    }

    if (approvedUsers.length > 0) {
      list.push({
        title: "Aprovados",
        users: approvedUsers,
      });
    }

    return list;
  }, [approvedUsers, notApprovedUsers]);

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full space-y-6 py-2 align-middle sm:px-6 lg:px-8">
          {dataset.map(({ title, users }) => (
            <div key={title} className="">
              <h3 className="mb-4 text-2xl font-semibold">{title}</h3>

              {/*  */}
              <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Nome
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        CPF
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Data de Nascimento
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Celular
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Criado em
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">
                          {canEdit ? "Editar" : "Ver"}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.length === 0 && (
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4" colSpan={4}>
                          <div className="text-sm text-gray-500">
                            Não existe nenhum usuário cadastrado
                          </div>
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.name}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="size-10 shrink-0">
                              <Image
                                unoptimized={
                                  process.env.ENVIRONMENT !== "PRODUCTION"
                                }
                                src={u.avatar}
                                className="size-10 rounded-full object-cover"
                                alt={u.name}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {u.name}
                                {!u.approvedBy?.name && (
                                  <span
                                    className={clsx(
                                      "text-sm",
                                      "ml-2 inline-flex rounded-full bg-yellow-100 px-2 font-medium leading-5 text-yellow-800"
                                    )}
                                  >
                                    não aprovado
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCpf(u.cpf)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="text-sm font-medium text-gray-900 lg:hidden">
                            {dayToDDMMYYYY(u.birthday, "/")}
                          </div>
                          <div className="hidden text-sm font-medium text-gray-900 lg:block">
                            {dayToLocaleString(u.birthday)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {u.phoneNumber
                            ? formatPhoneNumber(u.phoneNumber)
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 lg:hidden">
                            {dayToDDMMYYYY(u.createdAt, "/")}
                          </div>
                          <div className="hidden text-sm font-medium text-gray-900 lg:block">
                            {dayToLocaleString(u.createdAt)}
                          </div>
                        </td>
                        <td className="space-x-4 whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Link
                            href={`/pessoas/${u.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {canEdit ? "Editar" : "Ver"}
                          </Link>
                          {!u.approvedBy?.name && (
                            <ApproveUserButton size="sm" userId={u.id} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/*  */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
