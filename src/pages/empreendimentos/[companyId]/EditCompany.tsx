import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useUpdateCompany } from "@/swr/company";
import { isValidCnpj } from "@/utils/cnpj";

import { CompanyPageProps } from "./index.public";

type EditCompanyProps = {
  company: CompanyPageProps["company"];
};

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

const EditCompany: React.FC<EditCompanyProps> = ({ company }) => {
  const { user: me } = useUser();
  const { updateCompany, loading } = useUpdateCompany();

  const canEdit = me && authorization.can(me, "edit:company");

  const {
    control,
    register,
    handleSubmit,

    watch,
    formState: { errors, touchedFields },
  } = useForm<z.infer<typeof schema>>({
    mode: "onTouched",
    defaultValues: {
      name: company.name,
      formalized: company.formalized,
      cnpj: company.cnpj || "",
      fantasyName: company.fantasyName || "",
      email: company.email || "",
      phoneNumber: company.phoneNumber || "",
    },
    resolver: zodResolver(schema),
  });

  const watchFormalized = watch("formalized");
  const registerWithMask = useHookFormMask(register);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (e) => {
    await updateCompany(company.id, e);
  };

  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Informações do empreendimento
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

export default EditCompany;
