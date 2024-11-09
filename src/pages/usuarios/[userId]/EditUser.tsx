import React, { useRef } from "react";

import Image from "next/image";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { Controller, useForm } from "react-hook-form";
import * as zod from "zod";

import Input from "@/components/Input";
import MultipleSelect from "@/components/MultipleSelect";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useUpdateUser } from "@/swr/users";
import { capitalizeFirstLetter } from "@/utils/string";

type EditUserProps = {
  user: Omit<User, "password">;
};

const schema = zod.object({
  name: zod.string().min(5, "Mínimo 5 caracteres"),
  features: zod.array(zod.string()),
  avatar: zod.instanceof(File).optional(),
});

const EditUser: React.FC<EditUserProps> = ({ user }) => {
  const { query } = useRouter();
  const userId = query.userId as string;
  const inputAvatarRef = useRef<HTMLInputElement>(null);
  const { user: me } = useUser();
  const { updateUser, loading } = useUpdateUser();

  const canEdit = me && authorization.can(me, "edit:user");

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: user.name,
      features: user.features,
      avatar: null as FileList | null,
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (e: {
    name: string;
    features: string[];
    avatar: FileList | null;
  }) => {
    await updateUser(userId, e);
  };

  const { ref: avatarRef, ...avatarFields } = register("avatar", {
    onChange: () => trigger("avatar"),
  });

  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Informações do usuário
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Cuidado ao fornecer permissões
          </p>
        </div>
      </div>
      <div className="mt-5 md:col-span-2 md:mt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="shadow sm:rounded-md">
            <div className="bg-white px-4 py-5 sm:rounded-t-md sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <Input
                    {...register("name")}
                    label="Nome"
                    error={errors.name?.message}
                    touched={touchedFields.name}
                    disabled={!canEdit}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="E-mail"
                    type="text"
                    value={user.email}
                    disabled
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Controller
                    control={control}
                    name="features"
                    render={({ field }) => (
                      <MultipleSelect
                        label="Permissões de sistema"
                        options={[...authorization.systemFeaturesSet].map(
                          (feature) => ({
                            label: capitalizeFirstLetter(
                              feature.replace(":", " ")
                            ),
                            value: feature,
                          })
                        )}
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                        disabled={!canEdit}
                      />
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Foto
                  </label>
                  <div className="mt-1 flex items-center">
                    <span className="relative inline-block size-12 overflow-hidden rounded-full bg-gray-100">
                      <Image
                        src={
                          getValues().avatar
                            ? URL.createObjectURL(getValues().avatar![0])
                            : user?.avatar ||
                              "https://i.ibb.co/k0tSSCy/user.png"
                        }
                        alt="avatar"
                        width={48}
                        height={48}
                        className="size-12 object-cover"
                      />
                    </span>
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          className="ml-5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => {
                            inputAvatarRef.current?.click();
                          }}
                        >
                          Trocar
                        </button>
                        <input
                          {...avatarFields}
                          ref={(instance) => {
                            avatarRef(instance);
                            // @ts-expect-error inputAvatarRef.current is not null
                            inputAvatarRef.current = instance;
                          }}
                          type="file"
                          className="hidden"
                          multiple={false}
                          accept="image/png, image/gif, image/jpeg"
                        />
                      </>
                    )}
                  </div>
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

export default EditUser;
