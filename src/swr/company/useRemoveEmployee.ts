import { useState } from "react";

import { Company } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

function useRemoveEmployee() {
  const [loading, setLoading] = useState(false);

  const removeEmployee = async (companyId: string, employeeId: string) => {
    setLoading(true);

    try {
      await api.delete<Company>(
        `/api/companies/${companyId}/employees/${employeeId}`,
      );
    } catch {
      toast.error("Erro ao remover funcionário");
    }

    setLoading(false);
  };

  return { removeEmployee, loading };
}

export default useRemoveEmployee;
