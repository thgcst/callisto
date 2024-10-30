import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { parse } from "cookie";
import { useFormik } from "formik";
import * as yup from "yup";

import Input from "@/components/Input";
import session from "@/models/session";
import { useCreateSession } from "@/swr/sessions";

const validationSchema = yup.object().shape({
  email: yup.string().email("E-mail inválido").required("Campo obrigatório"),
  password: yup.string().required("Campo obrigatório"),
});

export default function Login() {
  const { createSession, loading } = useCreateSession();

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (e) => {
      await createSession(e);
    },
    validationSchema,
  });

  return (
    <>
      <Head>
        <meta name="theme-color" content="rgb(243, 244, 246)" />
      </Head>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="relative mx-auto h-12 w-auto">
              <Image
                src="/globe.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Entre na sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              ou solicite um usuário
            </p>
          </div>
          <form
            className="mt-8 flex flex-col gap-6 bg-white px-4 py-5 shadow sm:rounded-md sm:p-6"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
            noValidate
          >
            <Input
              label="E-mail"
              name="email"
              type="email"
              onChange={handleChange("email")}
              value={values.email}
              error={errors.email}
              touched={touched.email}
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              onChange={handleChange("password")}
              value={values.password}
              error={errors.password}
              touched={touched.password}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/recuperar"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              className="group relative mt-4 flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? "Carregando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { sessionToken } = parse(ctx.req.headers.cookie || "");

  const sessionValid = await session.isSessionValid(sessionToken);

  if (sessionValid) {
    return {
      redirect: {
        destination: "/empresas",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};
