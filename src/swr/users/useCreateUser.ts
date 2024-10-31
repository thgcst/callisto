import { useState } from "react";

import { User } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  motherName?: string;
  cpf: string;
  birthday: string;
  phoneNumber?: string;
  addressId?: string;
};

function useCreateUser() {
  const [loading, setLoading] = useState(false);

  const createUser = async (body: CreateUserBody) => {
    setLoading(true);

    try {
      const user = await toast.promise(
        api.post<Omit<User, "password">>(`/api/users/create`, body, {
          timeout: 60000,
        }),
        {
          pending: "Criando usuário...",
          success: "Usuário criado com sucesso!",
          error: {
            render({ data }) {
              // @ts-ignore
              return data.response?.data?.message || data.message;
            },
          },
        }
      );
      setLoading(false);
      return user.data;
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { createUser, loading };
}

export default useCreateUser;
