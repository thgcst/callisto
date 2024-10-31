import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import cep from "cep-promise";
import { parse } from "cookie";
import { isBefore, subYears } from "date-fns";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Input from "@/components/Input";
import Select from "@/components/Select";
import session from "@/models/session";
import { useCreateAddress } from "@/swr/address";
import useCreateUser from "@/swr/users/useCreateUser";

const brazilStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RR", label: "Roraima" },
  { value: "RO", label: "Rondônia" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const schema = z
  .object({
    name: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z
      .string()
      .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
    confirmPassword: z.string(),
    motherName: z
      .string()
      .min(5, { message: "Mínimo de 5 caracteres" })
      .optional(),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
      message: "CPF deve estar no formato 000.000.000-00",
    }),
    birthday: z
      .preprocess((val) => {
        if (typeof val === "string") {
          return new Date(val);
        }
        return val;
      }, z.date({ message: "Data de nascimento inválida" }))
      .refine(
        (val) => {
          return isBefore(val, subYears(new Date(), 18));
        },
        { message: "Você deve ter pelo menos 18 anos" }
      )
      .transform(String),
    phoneNumber: z
      .string()
      .regex(/^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/, {
        message: "Número inválido",
      })
      .optional(),
    cep: z.string().regex(/^\d{5}-\d{3}$/, {
      message: "CEP inválido",
    }),
    street: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
    number: z.string().min(1, { message: "Campo obrigatório" }),
    complement: z.string().optional(),
    city: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
    state: z
      .string()
      .length(2, { message: "Estado deve ter 2 caracteres (UF)" }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
      });
    }
  });

export default function Register() {
  const { push } = useRouter();
  const { createAddress } = useCreateAddress();
  const { createUser } = useCreateUser();
  const loading = false;
  const {
    register,
    formState: { errors, touchedFields },
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      motherName: "",
      cpf: "",
      birthday: "",
      phoneNumber: "",

      cep: "",
      street: "",
      number: "",
      complement: "",
      city: "",
      state: "",
    },

    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    const address = await createAddress({
      cep: values.cep,
      street: values.street,
      number: values.number,
      complement: values.complement,
      city: values.city,
      state: values.state,
    });
    if (!address) {
      return;
    }
    const user = await createUser({
      name: values.name,
      email: values.email,
      password: values.password,
      motherName: values.motherName,
      cpf: values.cpf,
      birthday: values.birthday,
      phoneNumber: values.phoneNumber,
      addressId: address.id,
    });
    if (!user) {
      return;
    }

    push(`/cadastro/confirmacao/${user.id}`);
  };

  async function fetchAddressFromCep(cepString: string) {
    try {
      const { street, city, state } = await cep(cepString);
      setValue("street", street);
      setValue("city", city);
      setValue("state", state);
    } catch (error) {
      console.error(error);
    }
  }

  const registerWithMask = useHookFormMask(register);

  return (
    <>
      <Head>
        <meta name="theme-color" content="rgb(243, 244, 246)" />
      </Head>
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
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
              Cadastro
            </h2>
          </div>
          <form
            className="mt-8 flex flex-col gap-6 bg-white px-4 py-5 shadow sm:rounded-md sm:p-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <p className="m-0 text-xl font-bold text-gray-900">
              Informações pessoais
            </p>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3">
                <Input
                  label="Nome"
                  {...register("name")}
                  error={errors.name?.message}
                  touched={touchedFields.name}
                />
              </div>

              <div className="col-span-3">
                <Input
                  label="E-mail"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  touched={touchedFields.email}
                />
              </div>

              <div className="col-span-3">
                <Input
                  label="Nome da mãe"
                  {...register("motherName")}
                  error={errors.motherName?.message}
                  touched={touchedFields.motherName}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="CPF"
                  {...registerWithMask("cpf", "cpf")}
                  error={errors.cpf?.message}
                  touched={touchedFields.cpf}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Data de nascimento"
                  type="date"
                  {...register("birthday")}
                  error={errors.birthday?.message}
                  touched={touchedFields.birthday}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Celular"
                  {...register("phoneNumber")}
                  {...registerWithMask("phoneNumber", [
                    "(99) 9999-9999",
                    "(99) 99999-9999",
                  ])}
                  error={errors.phoneNumber?.message}
                  touched={touchedFields.phoneNumber}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Senha"
                  type="password"
                  {...register("password")}
                  error={errors.password?.message}
                  touched={touchedFields.password}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Confirmar senha"
                  type="password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                  touched={touchedFields.confirmPassword}
                />
              </div>
            </div>
            <hr />
            <p className="m-0 text-xl font-bold text-gray-900">Endereço</p>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3">
                <Input
                  label="CEP"
                  {...registerWithMask("cep", "99999-999")}
                  onChange={(e) => {
                    register("cep").onChange(e);
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    if (onlyNumbers.length === 8) {
                      fetchAddressFromCep(onlyNumbers);
                    }
                  }}
                  error={errors.cep?.message}
                  touched={touchedFields.cep}
                />
              </div>

              <div className="col-span-6">
                <Input
                  label="Rua"
                  {...register("street")}
                  error={errors.street?.message}
                  touched={touchedFields.street}
                />
              </div>

              <div className="col-span-3">
                <Input
                  label="Número"
                  {...register("number")}
                  error={errors.number?.message}
                  touched={touchedFields.number}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Complemento"
                  {...register("complement")}
                  error={errors.complement?.message}
                  touched={touchedFields.complement}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Cidade"
                  {...register("city")}
                  error={errors.city?.message}
                  touched={touchedFields.city}
                />
              </div>
              <div className="col-span-3">
                <Select
                  label="Estado"
                  {...register("state")}
                  error={errors.state?.message}
                  touched={touchedFields.state}
                >
                  <option value="" disabled>
                    Selecione um estado
                  </option>
                  {brazilStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loading ? "Carregando..." : "Criar conta"}
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
