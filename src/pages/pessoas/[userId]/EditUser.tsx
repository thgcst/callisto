import React from "react";

import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import cep from "cep-promise";
import { isBefore, subYears } from "date-fns";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Input from "@/components/Input";
import Select from "@/components/Select";
import { useUpdateAddress } from "@/swr/address";
import { useUpdateUser } from "@/swr/users";
import { brazilStates } from "@/utils/brazilStates";
import { dayToYYYYMMDD } from "@/utils/dates";
import { formatCep, formatCpf, formatPhoneNumber } from "@/utils/format";

import { getServerSideProps } from "./index.public";

type EditUserProps = {
  user: InferGetServerSidePropsType<typeof getServerSideProps>["user"];
  address: InferGetServerSidePropsType<typeof getServerSideProps>["address"];
};

const schema = z.object({
  name: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
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

  role: z.nativeEnum(Role),
  cep: z.string().regex(/^\d{5}-\d{3}$/, {
    message: "CEP inválido",
  }),
  street: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
  number: z.string().min(1, { message: "Campo obrigatório" }),
  complement: z.string().optional(),
  city: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
  state: z.string().length(2, { message: "Estado deve ter 2 caracteres (UF)" }),
});

const EditUser: React.FC<EditUserProps> = ({ user, address }) => {
  const router = useRouter();
  const { updateUser, loading: loadingUpdateUser } = useUpdateUser();
  const { updateAddress, loading: loadingUpdateAddress } = useUpdateAddress();
  const loading = loadingUpdateUser || loadingUpdateAddress;

  const {
    register,
    formState: { errors, touchedFields },
    handleSubmit,
    setValue,
  } = useForm({
    values: {
      name: user.name,
      motherName: user.motherName || "",
      cpf: formatCpf(user.cpf),
      birthday: dayToYYYYMMDD(user.birthday),
      phoneNumber: user.phoneNumber ? formatPhoneNumber(user.phoneNumber) : "",
      role: user.role,

      cep: formatCep(address.cep),
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      city: address.city,
      state: address.state,
    },

    resolver: zodResolver(schema),
  });
  const registerWithMask = useHookFormMask(register);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (values) => {
    function updateUserIfNecessary() {
      if (
        user.name === values.name &&
        user.motherName === values.motherName &&
        user.cpf === values.cpf.replace(/\D/g, "") &&
        user.birthday === values.birthday &&
        user.phoneNumber === values.phoneNumber?.replace(/\D/g, "") &&
        user.role === values.role
      ) {
        return Promise.resolve();
      }

      return updateUser(user.id, {
        name: values.name,
        motherName: values.motherName,
        cpf: values.cpf,
        birthday: values.birthday,
        phoneNumber: values.phoneNumber,
        role: values.role,
      });
    }

    function updateAddressIfNecessary() {
      if (
        address.cep === values.cep.replace(/\D/g, "") &&
        address.street === values.street &&
        address.number === values.number &&
        address.complement === values.complement &&
        address.city === values.city &&
        address.state === values.state
      ) {
        return Promise.resolve();
      }

      return updateAddress(address.id, {
        cep: values.cep,
        street: values.street,
        number: values.number,
        complement: values.complement,
        city: values.city,
        state: values.state,
      });
    }

    await Promise.all([updateUserIfNecessary(), updateAddressIfNecessary()]);
    router.replace(router.asPath);
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

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Informações pessoais
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Atenção ao alterar informações sensíveis.
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="flex flex-col gap-6 bg-white px-4 py-5 sm:p-6">
                <p className="m-0 text-xl font-bold text-gray-900">
                  Informações pessoais
                </p>
                <div className="grid grid-cols-6 gap-6">
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
                      disabled
                      defaultValue={user.email}
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
                      {...registerWithMask("cpf", "cpf")}
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
                      {...registerWithMask("phoneNumber", [
                        "(99) 9999-9999",
                        "(99) 99999-9999",
                      ])}
                      error={errors.phoneNumber?.message}
                      touched={touchedFields.phoneNumber}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Select
                      label="Perfil"
                      {...register("role")}
                      error={errors.role?.message}
                      touched={touchedFields.role}
                    >
                      <option value="" disabled>
                        Selecione um perfil
                      </option>
                      <option value={Role.ADMIN}>Administrador</option>
                      <option value={Role.USER}>Usuário</option>
                    </Select>
                  </div>
                </div>
                <hr />
                <p className="m-0 text-xl font-bold text-gray-900">Endereço</p>
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      label="CEP"
                      {...registerWithMask("cep", "99999-999")}
                      onChange={(e) => {
                        registerWithMask("cep", "99999-999").onChange(e);
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

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      label="Número"
                      {...register("number")}
                      error={errors.number?.message}
                      touched={touchedFields.number}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      label="Complemento"
                      {...register("complement")}
                      error={errors.complement?.message}
                      touched={touchedFields.complement}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      label="Cidade"
                      {...register("city")}
                      error={errors.city?.message}
                      touched={touchedFields.city}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
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
              </div>

              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
