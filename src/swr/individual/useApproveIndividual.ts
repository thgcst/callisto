import { useState } from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

type ApproveIndividualBody = {
  individualId: string;
};

function useApproveIndividual() {
  const [loading, setLoading] = useState(false);

  const approveIndividual = async (body: ApproveIndividualBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(
          `/api/individuals/${body.individualId}/approve`,
          {},
          {
            timeout: 60000,
          },
        ),
        {
          pending: "Aprovando cadastro...",
          success: "Cadastro aprovado com sucesso!",
          error: {
            render({ data }) {
              // @ts-expect-error - TS doesn't know about this property
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

  return { approveIndividual, loading };
}

export default useApproveIndividual;
