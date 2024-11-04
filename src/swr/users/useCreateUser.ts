import { useState } from "react";

import { useRouter } from "next/router";

import { toast } from "react-toastify";

import api from "@/services/api";

type CreateUserBody = {
  name: string;
  email: string;
  features: string[];
  avatar: FileList | null;
};

function useCreateUser() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const createUser = async (body: CreateUserBody) => {
    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", body.name);

      data.append("features", JSON.stringify(body.features));

      data.append("email", body.email);

      if (body.avatar) {
        data.append("avatar", body.avatar[0]);
      }

      await toast.promise(
        api.post(`/api/users/create`, data, {
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
      push(`/usuarios`);
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { createUser, loading };
}

export default useCreateUser;
