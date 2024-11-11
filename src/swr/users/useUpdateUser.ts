import { useState } from "react";

import { useRouter } from "next/router";

import { toast } from "react-toastify";

import api from "@/services/api";

type UpdateUserBody = {
  name: string;
  features?: string[];
  avatar?: FileList | null;
};

function useUpdateUser() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const updateUser = async (id: string, body: UpdateUserBody) => {
    setLoading(true);

    try {
      const data = new FormData();

      if (body.name) {
        data.append("name", body.name);
      }

      if (body.features) {
        data.append("features", JSON.stringify(body.features));
      }

      if (body.avatar) {
        data.append("avatar", body.avatar[0]);
      }

      await toast.promise(api.patch(`/api/user/${id}/update`, data), {
        pending: "Atualizando usuário...",
        success: "Usuário atualizado com sucesso!",
        error: {
          render({ data }) {
            // @ts-expect-error data is not null
            return data.response?.data?.message || data.message;
          },
        },
      });
      push(`/usuarios/${id}`);
    } catch {
      //
    }

    setLoading(false);
  };

  return { updateUser, loading };
}

export default useUpdateUser;
