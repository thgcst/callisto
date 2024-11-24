import { useState } from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

type ApproveCompaniesBody = {
  companyIds: string[];
};

function useApproveCompanies() {
  const [loading, setLoading] = useState(false);

  const approveCompanies = async (body: ApproveCompaniesBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(`/api/companies/approve`, body, {
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

  return { approveCompanies, loading };
}

export default useApproveCompanies;
