import { useState } from "react";

import { useRouter } from "next/router";

import api from "@/services/api";
import { toast } from "react-toastify";

type CreateSessionBody = {
  email: string;
  password: string;
};

function useCreateSession() {
  const { push, query } = useRouter();
  const [loading, setLoading] = useState(false);

  const createSession = async (body: CreateSessionBody) => {
    setLoading(true);

    try {
      await toast.promise(
        api.post("/api/sessions", {
          email: body.email,
          password: body.password,
        }),
        {
          pending: "Carregando...",
          error: {
            render({ data }) {
              // @ts-ignore
              return data.response?.data?.message || data.message;
            },
          },
        }
      );
      if (query?.redirect) {
        push(query.redirect as string);
      } else {
        push(`/classes`);
      }
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { createSession, loading };
}

export default useCreateSession;
