import { useRef, useState } from "react";

import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { parse } from "cookie";
import { useForm } from "react-hook-form";
import * as zod from "zod";

import Input from "@/components/Input";
import Layout from "@/components/Layout";
import session from "@/models/session";
import { useUpdateMe } from "@/swr/users";

type ProfileProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const schema = zod.object({
  name: zod.string().min(5, "Mínimo 5 caracteres"),
  avatar: zod.instanceof(File).optional(),
});

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const inputAvatarRef = useRef<HTMLInputElement>(null);
  const { updateMe } = useUpdateMe();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    trigger,
    formState: { errors, touchedFields },
  } = useForm({
    values: {
      name: user.name,
      avatar: null as FileList | null,
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (e: { name: string; avatar: FileList | null }) => {
    await updateMe(e);
    setEditing((e) => !e);
  };

  const { ref: avatarRef, ...avatarFields } = register("avatar", {
    onChange: () => trigger("avatar"),
  });

  return (
    <Layout label="Perfil">
      <form
        className="overflow-hidden bg-white shadow sm:rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex h-16 flex-row-reverse items-center justify-between px-4 sm:px-6">
          <div className="flex gap-4">
            {editing ? (
              <>
                <button
                  type="button"
                  className={clsx(
                    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  )}
                  onClick={() => {
                    reset();
                    setEditing(false);
                  }}
                >
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span>Salvar</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setEditing(true)}
              >
                <span>Editar</span>
              </button>
            )}
          </div>
          <h3
            className={clsx(
              "text-lg font-medium leading-6 text-gray-900",
              editing && "hidden sm:block",
            )}
          >
            Informações pessoais
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nome</dt>
              {editing ? (
                <Input
                  placeholder="Nome"
                  {...register("name")}
                  error={errors.name?.message}
                  touched={touchedFields.name}
                />
              ) : (
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.name}
                </dd>
              )}
            </div>
            <div
              className={clsx(
                "bg-white px-4 py-5 transition-all sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6",
                editing && "opacity-40 blur-sm",
              )}
            >
              <dt className="text-sm font-medium text-gray-500">E-mail</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user.email}
              </dd>
            </div>
            <div className="items-center bg-gray-50 px-4 py-5 sm:grid sm:h-16 sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-2">
              <dt className="text-sm font-medium text-gray-500">
                Foto de perfil
              </dt>
              <dd className="mt-1 flex items-center sm:col-span-2 sm:mt-0">
                <Image
                  className="size-10 rounded-full"
                  src={
                    getValues().avatar
                      ? URL.createObjectURL(getValues().avatar![0])
                      : user?.avatar || "https://i.ibb.co/k0tSSCy/user.png"
                  }
                  alt="avatar"
                  width={40}
                  height={40}
                />
                {editing && (
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
              </dd>
            </div>
            <div
              className={clsx(
                "bg-white px-4 py-5 transition-all sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6",
                editing && "opacity-40 blur-sm",
              )}
            >
              <dt className="text-sm font-medium text-gray-500">Permissões</dt>
              <dd className="mt-1 flex flex-wrap gap-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user.features.map((item) => (
                  <span key={item} className="rounded-[2px] bg-gray-100 px-1">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </form>
    </Layout>
  );
};

export default Profile;

export const getServerSideProps = (async (ctx) => {
  const { sessionToken } = parse(ctx.req.headers.cookie || "");

  const sessionValid = await session.isSessionValid(sessionToken);

  if (!sessionValid) {
    return {
      redirect: {
        destination: `/login?redirect=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        ...sessionValid.user,
        createdAt: String(sessionValid.user.createdAt),
        updatedAt: String(sessionValid.user.updatedAt),
      },
    },
  };
}) satisfies GetServerSideProps;
