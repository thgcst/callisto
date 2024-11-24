import { useState } from "react";

import { useRouter } from "next/router";

import { Company } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type CreateCompanyBody = {
  name: string;
  formalized: boolean;
  cnpj?: string;
  fantasyName?: string;
  email?: string;
  phoneNumber?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    city: string;
    state: string;
  };
};

function useCreateCompany() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const createCompany = async (body: CreateCompanyBody) => {
    setLoading(true);

    try {
      const res = await toast.promise(
        api.post<Company>(`/api/companies`, body, {
          timeout: 60000,
        }),
        {
          pending: "Criando empreendimento...",
          success: "Cadastro criado com sucesso!",
          error: {
            render({ data }) {
              // @ts-expect-error data is any
              return data.response?.data?.message || data.message;
            },
          },
        },
      );
      push(`/cadastro/empreendimento/confirmacao/${res.data.id}`);
    } catch {
      //
    }

    setLoading(false);
  };

  return { createCompany, loading };
}

export default useCreateCompany;
