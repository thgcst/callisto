import { useState } from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

type ApproveCompanyBody = {
  companyId: string;
};

function useApproveCompany() {
  const [loading, setLoading] = useState(false);

  const approveCompany = async (body: ApproveCompanyBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(
          `/api/companies/${body.companyId}/approve`,
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

  return { approveCompany, loading };
}

export default useApproveCompany;
