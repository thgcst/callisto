import { useState } from "react";

import { useRouter } from "next/router";

import { toast } from "react-toastify";

import api from "@/services/api";

function useActivateAccount() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const activateAccount = async (tokenId: string, password: string) => {
    setLoading(true);

    try {
      await toast.promise(
        api.patch(`/api/activation/${tokenId}`, {
          password,
        }),
        {
          pending: "Carregando...",
          error: {
            render({ data }) {
              // @ts-expect-error
              return data.response?.data?.message || data.message;
            },
          },
        }
      );
      push(`/empresas`);
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { activateAccount, loading };
}

export default useActivateAccount;
