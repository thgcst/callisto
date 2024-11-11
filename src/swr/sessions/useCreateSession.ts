import { useState } from "react";

import { useRouter } from "next/router";

import { toast } from "react-toastify";

import { useUser } from "@/contexts/userContext";
import api from "@/services/api";

type CreateSessionBody = {
  email: string;
  password: string;
};

function useCreateSession() {
  const { fetchUser } = useUser();
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
              // @ts-expect-error data is any
              return data.response?.data?.message || data.message;
            },
          },
        },
      );
      void fetchUser();
      if (query?.redirect) {
        push(query.redirect as string);
      } else {
        push(`/pessoas`);
      }
    } catch {
      //
    }

    setLoading(false);
  };

  return { createSession, loading };
}

export default useCreateSession;
