import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";

import { CheckIcon } from "@heroicons/react/24/outline";
import { parse } from "cookie";

import individual from "@/models/individual";
import session from "@/models/session";

export default function RegisterConfirmation({
  individualEmail,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <meta name="theme-color" content="rgb(243, 244, 246)" />
      </Head>
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="mt-8 flex flex-col items-center bg-white px-4 py-5 shadow sm:rounded-md sm:p-6">
            <div className="flex size-12 items-center justify-center self-center rounded-full bg-green-100">
              <CheckIcon className="size-6 text-green-600" />
            </div>
            <p className="mt-5 text-base font-semibold text-gray-900">
              Cadastro realizado
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Seus dados serão analisados e, caso aprovados, você receberá um
              e-mail de confirmação em:
            </p>
            <p className="mt-2 text-center text-sm font-semibold text-gray-500">
              {individualEmail}
            </p>
            <Link
              href="/"
              className="mt-6 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Voltar à tela de login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = (async (ctx) => {
  const { sessionToken } = parse(ctx.req.headers.cookie || "");

  const sessionValid = await session.isSessionValid(sessionToken);

  if (sessionValid) {
    return {
      redirect: {
        destination: "/pessoas",
        permanent: true,
      },
    };
  }

  const individualId = ctx.params?.individualId;

  if (typeof individualId !== "string") {
    return {
      notFound: true,
    };
  }

  const { email } = await individual.findOneById(individualId);

  return {
    props: {
      individualEmail: email,
    },
  };
}) satisfies GetServerSideProps;
