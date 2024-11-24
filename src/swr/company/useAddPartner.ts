import { useState } from "react";

import { Company } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

function useAddPartner() {
  const [loading, setLoading] = useState(false);

  const addPartner = async (companyId: string, partnerId: string) => {
    setLoading(true);

    try {
      await api.post<Company>(
        `/api/companies/${companyId}/partners/${partnerId}`,
      );
    } catch {
      toast.error("Erro ao adicionar sócio");
    }

    setLoading(false);
  };

  return { addPartner, loading };
}

export default useAddPartner;
