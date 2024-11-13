import { useState } from "react";

import { useRouter } from "next/router";

import { toast } from "react-toastify";

import api from "@/services/api";

function useRecoverPassword() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const recoverPassword = async (tokenId: string, password: string) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(`/api/recovery/${tokenId}`, {
          password,
        }),
        {
          pending: "Carregando...",
          error: {
            render({ data }) {
              // @ts-expect-error data is not null
              return data.response?.data?.message || data.message;
            },
          },
        },
      );
      push(`/pessoas`);
    } catch {
      //
    }

    setLoading(false);
  };

  return { recoverPassword, loading };
}

export default useRecoverPassword;
