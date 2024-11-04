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
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
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
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loading ? "Carregando..." : "Entrar"}
            </button>
            <Link
              href="/cadastro"
              className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Criar conta
            </Link>
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
        destination: "/pessoas",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};
