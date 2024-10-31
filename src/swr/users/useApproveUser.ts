import { useState } from "react";

import { toast } from "react-toastify";
import { mutate } from "swr";

import api from "@/services/api";

type ApproveUserBody = {
  userId: string;
};

function useApproveUser() {
  const [loading, setLoading] = useState(false);

  const approveUser = async (body: ApproveUserBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(`/api/user/${body.userId}/approve`, body, {
          timeout: 60000,
        }),
        {
          pending: "Aprovando cadastro...",
          success: "Cadastro aprovado com sucesso!",
          error: {
            render({ data }) {
              // @ts-ignore
              return data.response?.data?.message || data.message;
            },
          },
        }
      );

      mutate(["/api/users", { approved: false }]);
      mutate(["/api/users", { approved: true }]);
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { approveUser, loading };
}

export default useApproveUser;
