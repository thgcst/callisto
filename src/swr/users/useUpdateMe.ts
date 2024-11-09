import { useState } from "react";

import { useRouter } from "next/router";

import { toast } from "react-toastify";
import { mutate } from "swr";

import api from "@/services/api";

type UpdateMeBody = {
  name: string;
  avatar?: FileList | null;
};

function useUpdateMe() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const updateMe = async (body: UpdateMeBody) => {
    setLoading(true);

    try {
      const data = new FormData();

      if (body.name) {
        data.append("name", body.name);
      }

      if (body.avatar) {
        data.append("avatar", body.avatar[0]);
      }

      await toast.promise(api.patch(`/api/user/update`, data), {
        pending: "Atualizando usuário...",
        success: "Usuário atualizado com sucesso!",
        error: {
          render({ data }) {
            // @ts-expect-error data is any
            return data.response?.data?.message || data.message;
          },
        },
      });
      mutate(`/api/user`);
      push(`/minha-conta`);
    } catch {
      //
    }

    setLoading(false);
  };

  return { updateMe, loading };
}

export default useUpdateMe;
