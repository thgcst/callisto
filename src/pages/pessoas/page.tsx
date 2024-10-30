import React from "react";

import Image from "next/image";
import Link from "next/link";

import clsx from "clsx";

import authorization from "@/models/authorization";
import { usePerson, usePeople } from "@/swr/people";
import { dayToDDMMYYYY, dayToLocaleString } from "@/utils/dates";

const Page: React.FC = () => {
  const { person } = usePerson();
  const { people } = usePeople();

  const canEdit = person && authorization.roleIsAdmin(person);

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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
                    Sessões
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
                {people.length === 0 && (
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4" colSpan={4}>
                      <div className="text-sm text-gray-500">
                        Não existe nenhum usuário cadastrado
                      </div>
                    </td>
                  </tr>
                )}
                {people.map((u) => (
                  <tr key={u.name}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image
                            unoptimized={
                              process.env.ENVIRONMENT !== "PRODUCTION"
                            }
                            src={u.avatar}
                            className="h-10 w-10 rounded-full object-cover"
                            alt={u.name}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {u.name}
                            {!u.activated && (
                              <span
                                className={clsx(
                                  "text-sm",
                                  "ml-2 inline-flex rounded-full bg-yellow-100 px-2 font-medium leading-5 text-yellow-800"
                                )}
                              >
                                não ativado
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {u._count.session}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 lg:hidden">
                        {dayToDDMMYYYY(u.createdAt, "/")}
                      </div>
                      <div className="hidden text-sm font-medium text-gray-900 lg:block">
                        {dayToLocaleString(u.createdAt)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/pessoas/${u.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {canEdit ? "Editar" : "Ver"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
