import Head from "next/head";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import cep from "cep-promise";
import { isBefore, subYears } from "date-fns";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Input from "@/components/Input";
import Select from "@/components/Select";
import useCreateIndividual from "@/swr/individual/useCreateIndividual";
import { brazilStates } from "@/utils/brazilStates";
import { isValidCpf } from "@/utils/cpf";

const schema = z.object({
  name: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  motherName: z
    .string()
    .refine((val) => val === "" || val.length >= 5, "Mínimo de 5 caracteres"),
  cpf: z.string().refine((val) => isValidCpf(val), { message: "CPF inválido" }),
  birthday: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          return new Date(val);
        }
        return val;
      },
      z.date({ message: "Data de nascimento inválida" }),
    )
    .refine(
      (val) => {
        return isBefore(val, subYears(new Date(), 18));
      },
      { message: "Você deve ter pelo menos 18 anos" },
    )
    .transform(String),
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
});

type Schema = z.infer<typeof schema>;

export default function RegisterIndividual() {
  const { createIndividual, loading } = useCreateIndividual();
  const {
    register,
    formState: { errors, touchedFields },
    handleSubmit,
    setValue,
  } = useForm<Schema>({
    defaultValues: {
      name: "",
      email: "",
      motherName: "",
      cpf: "",
      birthday: "",
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

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    await createIndividual({
      name: values.name,
      email: values.email,
      motherName: values.motherName,
      cpf: values.cpf,
      birthday: values.birthday,
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
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Nome"
                  {...register("name")}
                  error={errors.name?.message}
                  touched={touchedFields.name}
                />
              </div>

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
                  label="Nome da mãe"
                  {...register("motherName")}
                  error={errors.motherName?.message}
                  touched={touchedFields.motherName}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="CPF"
                  {...registerWithMask("cpf", "cpf", {
                    jitMasking: true,
                  })}
                  error={errors.cpf?.message}
                  touched={touchedFields.cpf}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  label="Data de nascimento"
                  type="date"
                  {...register("birthday")}
                  error={errors.birthday?.message}
                  touched={touchedFields.birthday}
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
