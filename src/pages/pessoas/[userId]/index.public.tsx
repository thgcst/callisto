import React from "react";

import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";

import Layout from "@/components/Layout";
import address from "@/models/address";
import authorization from "@/models/authorization";
import session from "@/models/session";
import user from "@/models/user";

import EditUser from "./EditUser";

const StudentInfo: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, address }) => {
  return (
    <Layout label={user.name}>
      <EditUser user={user} address={address} />

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      {/* <Companies user={user} /> */}
    </Layout>
  );
};

export default StudentInfo;

export const getServerSideProps = (async (ctx) => {
  const { sessionToken } = parse(ctx.req.headers.cookie || "");

  const sessionValid = await session.isSessionValid(sessionToken);

  if (!sessionValid) {
    return {
      redirect: {
        destination: `/?redirect=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  if (!authorization.roleIsAdmin(sessionValid.user)) {
    return {
      notFound: true,
    };
  }

  const userId = ctx.params?.userId as string;

  try {
    const {
      name,
      id,
      email,
      addressId,
      approvedAt,
      approvedBy,
      approvedById,
      avatar,
      birthday,
      cpf,
      createdAt,
      motherName,
      phoneNumber,
      role,
      updatedAt,
    } = await user.findOneById(userId);

    const addressObject = await address.findOneById(addressId);

    return {
      props: {
        user: {
          name,
          id,
          email,
          addressId,
          approvedAt: approvedAt?.toISOString(),
          approvedBy,
          approvedById,
          avatar,
          birthday: birthday.toISOString(),
          cpf,
          motherName,
          phoneNumber,
          role,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
        address: {
          ...addressObject,
          createdAt: addressObject.createdAt.toISOString(),
          updatedAt: addressObject.updatedAt.toISOString(),
        },
      },
    };
  } catch (_) {
    return {
      notFound: true,
    };
  }
}) satisfies GetServerSideProps;
