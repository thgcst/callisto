import React from "react";

const Loading: React.FC = () => {
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
                    <span className="sr-only">Ver</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => {
                  return (
                    <tr key={item} className="animate-pulse">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="size-10 shrink-0">
                            <div className="relative size-10 rounded-full bg-gray-200"></div>
                          </div>
                          <div className="ml-4 flex flex-1 flex-col gap-1">
                            <div className="h-5 w-44 rounded-md bg-gray-200" />
                            <div className="h-4 w-48 rounded-md bg-gray-200" />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="h-5 w-48 rounded-md bg-gray-200" />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="h-5 w-12 rounded-md bg-gray-200" />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        Ver
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
