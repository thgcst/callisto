import { useState } from "react";

import { useRouter } from "next/router";

import { Individual } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type CreateIndividualBody = {
  name: string;
  email: string;
  motherName?: string;
  cpf: string;
  birthday: string;
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

function useCreateIndividual() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const createIndividual = async (body: CreateIndividualBody) => {
    setLoading(true);

    try {
      const res = await toast.promise(
        api.post<Individual>(`/api/individuals`, body, {
          timeout: 60000,
        }),
        {
          pending: "Criando cadastro...",
          success: "Cadastro criado com sucesso!",
          error: {
            render({ data }) {
              // @ts-expect-error data is any
              return data.response?.data?.message || data.message;
            },
          },
        },
      );
      push(`/cadastro/pessoa/confirmacao/${res.data.id}`);
    } catch {
      //
    }

    setLoading(false);
  };

  return { createIndividual, loading };
}

export default useCreateIndividual;
