import React from "react";

import Link from "next/link";

import { Student } from "@prisma/client";
import clsx from "clsx";

import { dayToDDMMYYYY, dayToLocaleString } from "~/utils/dates";

type AttendancesProps = {
   student: Omit<Student, "birthday"> & { birthday: string } & {
      attendances: {
         id: string;
         late: boolean;
         ebd: {
            teacher: Student | null;
         };
         ebdDay: Date;
         ebdGroup: string;
      }[];
   };
};

const Attendances: React.FC<AttendancesProps> = ({ student }) => {
   return (
      <div className="mt-10 sm:mt-0">
         <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
               <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                     Presença em aulas
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                     Aulas em que o aluno(a) compareceu
                  </p>
               </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
               <div className="overflow-hidden shadow sm:rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th
                              scope="col"
                              className="w-3 py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                           ></th>
                           <th
                              scope="col"
                              className="px-6 py-3 pl-0 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                           >
                              Dia
                           </th>
                           <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                           >
                              Grupo
                           </th>
                           <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Editar</span>
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 bg-white">
                        {student.attendances.length === 0 && (
                           <tr>
                              <td
                                 className="whitespace-nowrap px-6 py-4"
                                 colSpan={4}
                              >
                                 <div className="text-sm text-gray-500">
                                    O aluno(a) não compareceu a nenhuma aula
                                 </div>
                              </td>
                           </tr>
                        )}
                        {student.attendances.map((att) => (
                           <tr key={att.ebdDay.toString()} className="h-auto">
                              <td className="group whitespace-nowrap py-4 px-4">
                                 {att.late && (
                                    <div className="flex items-center">
                                       <div
                                          className={clsx(
                                             "flex h-2 w-2 cursor-default items-center justify-center overflow-hidden rounded-full bg-yellow-400",
                                             "transition-all duration-300 group-hover:h-5 group-hover:w-14 group-hover:bg-yellow-100"
                                          )}
                                       >
                                          <div className="text-xs font-semibold leading-5 text-yellow-800 opacity-0 duration-300 group-hover:opacity-100">
                                             Atraso
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 pl-0">
                                 <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900 lg:hidden">
                                       {dayToDDMMYYYY(att.ebdDay, "/")}
                                    </div>
                                    <div className="hidden text-sm font-medium text-gray-900 lg:block">
                                       {dayToLocaleString(att.ebdDay)}
                                    </div>
                                 </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                 <div className="text-sm text-gray-500">
                                    {att.ebdGroup}
                                 </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                 <Link
                                    href={`/classes/${
                                       att.ebdGroup
                                    }/ebds/${dayToDDMMYYYY(att.ebdDay)}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                 >
                                    Ver
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

export default Attendances;
