import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { parse } from "cookie";
import { useFormik } from "formik";
import * as yup from "yup";

import Input from "@/components/Input";
import { NotFoundError } from "@/errors";
import recovery from "@/models/recovery";
import user from "@/models/user";
import validator from "@/models/validator";
import { useRecoverPassword } from "@/swr/recovery";

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Mínimo de 8 dígitos")
    .required("Campo obrigatório"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não conferem"),
});

type ActivatePasswordProps =
  | {
      email: string;
      tokenId: string;
      error?: undefined;
    }
  | {
      email?: undefined;
      tokenId?: undefined;
      error: string;
    };

const ActivatePassword: React.FC<ActivatePasswordProps> = ({
  error,
  email,
  tokenId,
}) => {
  const { recoverPassword, loading } = useRecoverPassword();

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async (e) => {
      if (tokenId) {
        await recoverPassword(tokenId, e.password);
      }
    },
    validationSchema,
  });

  return (
    <>
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
              Recupere sua senha
            </h2>
            {email && (
              <p className="mt-2 text-center text-sm text-gray-600">
                Usuário:{" "}
                <span className="rounded-[2px] bg-gray-200 px-1">{email}</span>
              </p>
            )}
          </div>
          {error ? (
            <div className="mt-8 flex flex-col gap-2 bg-white px-4 py-5 shadow sm:rounded-md sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <ExclamationTriangleIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    {error}
                  </h3>
                  <Link
                    className="cursor-pointer text-sm font-normal text-indigo-600 hover:underline"
                    href="/recuperar"
                  >
                    <span aria-hidden="true">&larr;</span> Voltar à tela de
                    recuperação
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form
              className="mt-8 flex flex-col gap-6 bg-white px-4 py-5 shadow sm:rounded-md sm:p-6"
              action="#"
              method="POST"
              onSubmit={handleSubmit}
            >
              <Input
                label="Senha"
                name="password"
                type="password"
                onChange={handleChange("password")}
                value={values.password}
                error={errors.password}
                touched={touched.password}
              />

              <Input
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                onChange={handleChange("confirmPassword")}
                value={values.confirmPassword}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />

              <button
                type="submit"
                className="group relative mt-4 flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? "Carregando..." : "Definir senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivatePassword;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const parsedCookies = parse(ctx.req.headers?.cookie || "");

  if (parsedCookies?.sessionId) {
    return {
      redirect: {
        destination: "/empresas",
        permanent: true,
      },
    };
  }

  try {
    const cleanValues = validator(ctx.query, {
      tokenId: "required",
    });

    const tokenId = cleanValues.tokenId as string;

    const tokenObject = await recovery.findValidUnusedTokenById(tokenId);

    const userObject = await user.findOneById(tokenObject.userId);

    return {
      props: {
        tokenId,
        email: userObject.email,
      },
    };
  } catch (error) {
    let errorMessage = "Erro inesperado";

    if (error instanceof NotFoundError) {
      errorMessage = "Token inválido";
    }

    return {
      props: {
        error: errorMessage,
      },
    };
  }
};
