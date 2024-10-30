import { useState } from "react";

import { useRouter } from "next/router";

import api from "@/services/api";
import { toast } from "react-toastify";

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
      push(`/pessoas`);
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { activateAccount, loading };
}

export default useActivateAccount;
