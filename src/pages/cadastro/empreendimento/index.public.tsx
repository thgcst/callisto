import Head from "next/head";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import cep from "cep-promise";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import useCreateCompany from "@/swr/company/useCreateCompany";
import { brazilStates } from "@/utils/brazilStates";
import { isValidCnpj } from "@/utils/cnpj";

const schema = z
  .object({
    name: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
    formalized: z.boolean(),
    cnpj: z
      .string()
      .refine((val) => isValidCnpj(val), { message: "CNPJ inválido" }),
    fantasyName: z.string(),
    email: z.string().email({ message: "Email inválido" }),
    phoneNumber: z.union([
      z.string().regex(/^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/, {
        message: "Número inválido",
      }),
      z.string().optional(),
    ]),
    address: z.object({
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
    }),
  })
  .superRefine((data, ctx) => {
    if (data.formalized) {
      if (data.cnpj === undefined || data.cnpj === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["cnpj"],
        });
      }
      if (data.email === undefined || data.email === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["email"],
        });
      }
      if (data.phoneNumber === undefined || data.phoneNumber === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campo obrigatório",
          path: ["phoneNumber"],
        });
      }
    }
  });

type Schema = z.infer<typeof schema>;

export default function RegisterCompany() {
  const { createCompany, loading } = useCreateCompany();
  const {
    control,
    register,
    formState: { errors, touchedFields },
    handleSubmit,
    setValue,
    watch,
  } = useForm<Schema>({
    defaultValues: {
      name: "",
      formalized: false,
      cnpj: "",
      email: "",
      phoneNumber: "",
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        city: "",
        state: "",
      },
    },
    resolver: zodResolver(schema),
  });

  const watchFormalized = watch("formalized");

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    await createCompany({
      name: values.name,
      formalized: values.formalized,
      cnpj: values.cnpj,
      fantasyName: values.fantasyName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      address: {
        cep: values.address.cep,
        street: values.address.street,
        number: values.address.number,
        complement: values.address.complement,
        city: values.address.city,
        state: values.address.state,
      },
    });
  };

  async function fetchAddressFromCep(cepString: string) {
    try {
      const { street, city, state } = await cep(cepString);
      setValue("address.street", street);
      setValue("address.city", city);
      setValue("address.state", state);
    } catch {
      // Do nothing
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
              Cadastro de empreendimento
            </h2>
          </div>
          <form
            className="mt-8 flex flex-col gap-6 bg-white px-4 py-5 shadow sm:rounded-md sm:p-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <p className="m-0 text-xl font-bold text-gray-900">
              Informações do empreendimento
            </p>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6">
                <Input
                  label="Nome"
                  {...register("name")}
                  error={errors.name?.message}
                  touched={touchedFields.name}
                />
              </div>
              <div className="col-span-6">
                <Controller
                  name="formalized"
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Checkbox
                      label="A empresa é formalizada?"
                      checked={value}
                      {...rest}
                    />
                  )}
                />
              </div>
              {watchFormalized && (
                <>
                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      label="CNPJ"
                      {...registerWithMask("cnpj", "cnpj", {
                        jitMasking: true,
                      })}
                      error={errors.cnpj?.message}
                      touched={touchedFields.cnpj}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      label="Nome fantasia"
                      {...register("fantasyName")}
                      error={errors.fantasyName?.message}
                      touched={touchedFields.fantasyName}
                    />
                  </div>
                </>
              )}
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="E-mail"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  touched={touchedFields.email}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Celular"
                  {...registerWithMask(
                    "phoneNumber",
                    ["(99) 9999-9999", "(99) 99999-9999"],
                    {
                      clearMaskOnLostFocus: true,
                      jitMasking: true,
                    },
                  )}
                  error={errors.phoneNumber?.message}
                  touched={touchedFields.phoneNumber}
                />
              </div>
            </div>
            <hr />
            <p className="m-0 text-xl font-bold text-gray-900">Endereço</p>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Cep"
                  {...registerWithMask("address.cep", "99999-999", {
                    onChange: (e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      if (onlyNumbers.length === 8) {
                        fetchAddressFromCep(onlyNumbers);
                      }
                    },
                  })}
                  error={errors.address?.cep?.message}
                  touched={touchedFields.address?.cep}
                />
              </div>

              <div className="col-span-6">
                <Input
                  label="Rua"
                  {...register("address.street")}
                  error={errors.address?.street?.message}
                  touched={touchedFields.address?.street}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Número"
                  {...register("address.number")}
                  error={errors.address?.number?.message}
                  touched={touchedFields.address?.number}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Complemento"
                  {...register("address.complement")}
                  error={errors.address?.complement?.message}
                  touched={touchedFields.address?.complement}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Cidade"
                  {...register("address.city")}
                  error={errors.address?.city?.message}
                  touched={touchedFields.address?.city}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Select
                  label="Estado"
                  {...register("address.state")}
                  error={errors.address?.state?.message}
                  touched={touchedFields.address?.state}
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
