import { MutableRefObject } from "react";

import axios from "axios";

import api from "./api";

const fetcher =
  (abortRef?: MutableRefObject<AbortController | undefined>) =>
  async (url: string | [string, any]) => {
    try {
      if (abortRef?.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      const signal = controller.signal;
      if (abortRef) {
        abortRef.current = controller;
      }

      if (Array.isArray(url)) {
        const [path, params] = url;
        const res = await api.get(path, {
          params,
          signal,
        });
        return res.data;
      }

      const res = await api.get(url, {
        signal,
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
        return;
      }
      throw error;
    }
  };

export default fetcher;
