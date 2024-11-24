import { useState } from "react";

import { Company } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

function useRemovePartner() {
  const [loading, setLoading] = useState(false);

  const removePartner = async (companyId: string, partnerId: string) => {
    setLoading(true);

    try {
      await api.delete<Company>(
        `/api/companies/${companyId}/partners/${partnerId}`,
      );
    } catch {
      toast.error("Erro ao remover sócio");
    }

    setLoading(false);
  };

  return { removePartner, loading };
}

export default useRemovePartner;
