import { useState } from "react";

import { Individual } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type UpdateIndividualBody = Partial<{
  name: string;
  email: string;
  motherName: string;
  cpf: string;
  birthday: string;
  phoneNumber: string;
}>;

function useUpdateIndividual() {
  const [loading, setLoading] = useState(false);

  const updateIndividual = async (
    individualId: string,
    body: UpdateIndividualBody,
  ) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch<Individual>(`/api/individuals/${individualId}`, body, {
          timeout: 60000,
        }),
        {
          pending: "Atualizando...",
          success: "Pessoa atualizada com sucesso!",
          error: {
            render({ data }) {
              // @ts-expect-error data is any
              return data.response?.data?.message || data.message;
            },
          },
        },
      );
    } catch {
      //
    }

    setLoading(false);
  };

  return { updateIndividual, loading };
}

export default useUpdateIndividual;
