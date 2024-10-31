import { useState } from "react";

import { Role } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type UpdateUserBody = Partial<{
  name: string;
  motherName: string;
  cpf: string;
  birthday: string;
  phoneNumber: string;
  role: Role;
}>;

function useUpdateUser() {
  const [loading, setLoading] = useState(false);

  const updateUser = async (userId: string, body: UpdateUserBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(`/api/user/${userId}`, body, {
          timeout: 60000,
        }),
        {
          pending: "Atualizando cadastro...",
          success: "Cadastro atualizado com sucesso!",
          error: {
            render({ data }) {
              // @ts-ignore
              return data.response?.data?.message || data.message;
            },
          },
        }
      );
      setLoading(false);
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { updateUser, loading };
}

export default useUpdateUser;
