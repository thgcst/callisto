import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isBefore, subYears } from "date-fns";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Input from "@/components/Input";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useUpdateIndividual } from "@/swr/individual";
import { isValidCpf } from "@/utils/cpf";
import { formatCpf, formatPhoneNumber } from "@/utils/format";

import { IndividualPageProps } from "./index.public";

type EditIndividualProps = {
  individual: IndividualPageProps["individual"];
};

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
});

const EditIndividual: React.FC<EditIndividualProps> = ({ individual }) => {
  const { user: me } = useUser();
  const { updateIndividual, loading } = useUpdateIndividual();

  const canEdit = me && authorization.can(me, "edit:individual");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<z.infer<typeof schema>>({
    mode: "onTouched",
    defaultValues: {
      name: individual.name,
      email: individual.email,
      motherName: individual.motherName || "",
      cpf: formatCpf(individual.cpf),
      birthday: format(new Date(individual.birthday), "yyyy-MM-dd"),
      phoneNumber: individual.phoneNumber
        ? formatPhoneNumber(individual.phoneNumber)
        : "",
    },
    resolver: zodResolver(schema),
  });

  const registerWithMask = useHookFormMask(register);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (e) => {
    await updateIndividual(individual.id, e);
  };

  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Informações da pessoa
          </h3>
          {/* <p className="mt-1 text-sm text-gray-600">
            Cuidado ao fornecer permissões
          </p> */}
        </div>
      </div>
      <div className="mt-5 md:col-span-2 md:mt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="shadow sm:rounded-md">
            <div className="bg-white px-4 py-5 sm:rounded-t-md sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                {/*  */}
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
                {/*  */}
              </div>
            </div>
            {canEdit && (
              <div className="bg-gray-50 px-4 py-3 text-right sm:rounded-b-md sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIndividual;
