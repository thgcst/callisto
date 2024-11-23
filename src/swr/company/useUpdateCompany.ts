import { useState } from "react";

import { Company } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type UpdateCompanyBody = Partial<{
  name: string;
  formalized: boolean;
  cnpj: string;
  fantasyName: string;
  email: string;
  phoneNumber: string;
}>;

type UpdatePartnersBody = string[];

function useUpdateCompany() {
  const [loading, setLoading] = useState(false);

  const updateCompany = async (companyId: string, body: UpdateCompanyBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch<Company>(`/api/companies/${companyId}`, body, {
          timeout: 60000,
        }),
        {
          pending: "Atualizando empreendimento...",
          success: "Empreendimento atualizado com sucesso!",
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

  const updatePartners = async (companyId: string, partners: string[]) => {
    setLoading(true);

    try {
      await api.patch<Company>(
        `/api/companies/${companyId}`,
        { partners },
        {
          timeout: 60000,
        },
      );
    } catch {
      toast.error("Erro ao atualizar sócios");
    }

    setLoading(false);
  };

  return { updateCompany, updatePartners, loading };
}

export default useUpdateCompany;
