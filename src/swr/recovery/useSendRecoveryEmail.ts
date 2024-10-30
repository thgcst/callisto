import { useState } from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

function useSendRecoveryEmail() {
  const [loading, setLoading] = useState(false);

  const sendRecoveryEmail = async (email: string) => {
    setLoading(true);

    try {
      await toast.promise(
        api.post(
          `/api/recovery`,
          {
            email,
          },
          {
            timeout: 60000,
          }
        ),
        {
          pending: "Carregando...",
          success: "E-mail de recuperação enviado!",
          error: {
            render({ data }) {
              // @ts-expect-error
              return data.response?.data?.message || data.message;
            },
          },
        }
      );
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { sendRecoveryEmail, loading };
}

export default useSendRecoveryEmail;
