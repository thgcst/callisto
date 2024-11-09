import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import "nprogress/nprogress.css";

import { useEffect } from "react";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import NProgress from "nprogress";
import { toast, ToastContainer } from "react-toastify";
import { SWRConfig } from "swr";

import fetcher from "@/services/fetcher";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    const start = () => NProgress.start();
    const done = () => NProgress.done();

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <SWRConfig
      value={{
        fetcher: fetcher(),
        onError(err, key) {
          const statusCode = err.response?.status;
          if (statusCode === 401) {
            if (key === "/api/user") return;
            router.push("/");
          }
          toast.error(err.response?.data?.message || err.message, {
            toastId: statusCode === 401 ? "401" : key,
          });
        },
      }}
    >
      <Component {...pageProps} />
      <ToastContainer limit={3} />
    </SWRConfig>
  );
}
