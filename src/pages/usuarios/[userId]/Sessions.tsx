import React from "react";

import { useRouter } from "next/router";

import { formatDistanceToNow } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import SessionDetails from "@/components/SessionDetails";
import { useUserSessions } from "@/swr/users";

const Sessions: React.FC = () => {
  const { query } = useRouter();
  const userId = query.userId as string;
  const { sessions, isLoading } = useUserSessions(userId);

  type SessionDetailsRef = React.ElementRef<typeof SessionDetails>;
  const sessionDetailsRef = React.useRef<SessionDetailsRef>(null);

  return (
    <>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Sessões do usuário
              </h3>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="overflow-hidden shadow sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Último acesso
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Dispositivo
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Editar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    [1, 2, 3].map((item) => (
                      <tr key={item}>
                        <td className="whitespace-nowrap px-6 py-4" colSpan={3}>
                          <div className="h-6 w-full animate-pulse rounded-md bg-gray-200"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      {sessions.length === 0 && (
                        <tr>
                          <td
                            className="whitespace-nowrap px-6 py-4"
                            colSpan={3}
                          >
                            <div className="text-sm text-gray-500">
                              O usuário nunca acessou a aplicação.
                            </div>
                          </td>
                        </tr>
                      )}
                      {sessions.map((s) => (
                        <tr key={s.id} className="h-auto">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDistanceToNow(new Date(s.updatedAt), {
                                  locale: ptBR,
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {s.osName} - {s.osVersion}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <p
                              className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                              onClick={() => sessionDetailsRef.current?.open(s)}
                            >
                              Ver
                            </p>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <SessionDetails ref={sessionDetailsRef} />
    </>
  );
};

export default Sessions;
