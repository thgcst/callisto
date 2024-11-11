import { useState } from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

type ApproveIndividualsBody = {
  individualIds: string[];
};

function useApproveIndividuals() {
  const [loading, setLoading] = useState(false);

  const approveIndividuals = async (body: ApproveIndividualsBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(`/api/individuals/approve`, body, {
          timeout: 60000,
        }),
        {
          pending: "Aprovando cadastros...",
          success: "Cadastros aprovado com sucesso!",
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

  return { approveIndividuals, loading };
}

export default useApproveIndividuals;
