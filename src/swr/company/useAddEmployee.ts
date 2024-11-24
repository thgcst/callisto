import { useState } from "react";

import { Company } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

function useAddEmployee() {
  const [loading, setLoading] = useState(false);

  const addEmployee = async (companyId: string, employeeId: string) => {
    setLoading(true);

    try {
      await api.post<Company>(
        `/api/companies/${companyId}/employees/${employeeId}`,
      );
    } catch {
      toast.error("Erro ao adicionar funcionário");
    }

    setLoading(false);
  };

  return { addEmployee, loading };
}

export default useAddEmployee;
