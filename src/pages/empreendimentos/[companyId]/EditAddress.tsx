import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import cep from "cep-promise";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import * as z from "zod";

import Input from "@/components/Input";
import Select from "@/components/Select";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useUpdateAddress } from "@/swr/address";
import { brazilStates } from "@/utils/brazilStates";

import { CompanyPageProps } from "./index.public";

type EditAddressProps = {
  company: CompanyPageProps["company"];
};

const schema = z.object({
  cep: z.string().regex(/^\d{5}-\d{3}$/, {
    message: "CEP inválido",
  }),
  street: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
  number: z.string().min(1, { message: "Campo obrigatório" }),
  complement: z.string().optional(),
  city: z.string().min(5, { message: "Mínimo de 5 caracteres" }),
  state: z.string().length(2, { message: "Estado deve ter 2 caracteres (UF)" }),
});

const EditAddress: React.FC<EditAddressProps> = ({ company }) => {
  const { user: me } = useUser();
  const { updateAddress, loading } = useUpdateAddress();

  const canEdit = me && authorization.can(me, "edit:company");

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<z.infer<typeof schema>>({
    mode: "onTouched",
    defaultValues: {
      cep: company.address.cep,
      street: company.address.street,
      number: company.address.number,
      complement: company.address.complement || "",
      city: company.address.city,
      state: company.address.state,
    },
    resolver: zodResolver(schema),
  });

  const registerWithMask = useHookFormMask(register);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (e) => {
    await updateAddress(company.address.id, e);
  };

  async function fetchAddressFromCep(cepString: string) {
    try {
      const { street, city, state } = await cep(cepString);
      setValue("street", street);
      setValue("city", city);
      setValue("state", state);
    } catch {
      // Do nothing
    }
  }

  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Endereço
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
                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Cep"
                    {...registerWithMask("cep", "99999-999", {
                      onChange: (e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                        if (onlyNumbers.length === 8) {
                          fetchAddressFromCep(onlyNumbers);
                        }
                      },
                    })}
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

export default EditAddress;
