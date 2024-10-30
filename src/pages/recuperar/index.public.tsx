import Head from "next/head";
import Image from "next/image";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import Input from "@/components/Input";
import { useSendRecoveryEmail } from "@/swr/recovery";

function PasswordRecovery() {
  const { sendRecoveryEmail, loading } = useSendRecoveryEmail();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(
      yup.object().shape({
        email: yup
          .string()
          .email("E-mail inválido")
          .required("Campo obrigatório"),
      })
    ),
  });

  const onSubmit = async (data: { email: string }) => {
    await sendRecoveryEmail(data.email);
  };
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
              Esqueci minha senha
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              enviaremos um e-mail de recuperação para você
            </p>
          </div>
          <form
            className="mt-8 flex flex-col gap-6 bg-white px-4 py-5 shadow sm:rounded-md sm:p-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <Input
              {...register("email")}
              label="E-mail"
              type="email"
              error={errors.email?.message}
              touched={touchedFields.email}
            />

            <button
              type="submit"
              className="group relative mt-4 flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? "Carregando..." : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PasswordRecovery;
