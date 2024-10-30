import React from "react";

import { useRouter } from "next/router";

const ErrorPage: React.FC = () => {
  const { back } = useRouter();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-gray-900">Erro</div>
        <div className="mb-5 border-b border-gray-200 px-8 pb-5 text-center text-base font-normal text-gray-700">
          Parece que há algum erro nessa página
        </div>

        <a
          className="cursor-pointer text-base font-normal text-indigo-600 hover:underline"
          onClick={back}
        >
          Voltar à página anterior
        </a>
      </div>
    </div>
  );
};

export default ErrorPage;
