import { useState } from "react";
import {} from "cookie";

import { useRouter } from "next/router";

import nProgress from "nprogress";
import { toast } from "react-toastify";

import api from "@/services/api";

function useDeleteSession() {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);

  const deleteSession = async () => {
    setLoading(true);
    nProgress.start();

    try {
      await api.delete("/api/sessions");
    } catch (error) {
      toast.error("Erro ao deslogar");
      nProgress.remove();
    }
    push(`/`);

    setLoading(false);
  };

  return { deleteSession, loading };
}

export default useDeleteSession;
