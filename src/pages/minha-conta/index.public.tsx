import React from "react";

import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";

import address from "@/models/address";
import authorization from "@/models/authorization";
import session from "@/models/session";
import user from "@/models/user";

import UserInfo from "../pessoas/[userId]/index.public";

const MyAccount: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, address }) => {
  return <UserInfo user={user} address={address} />;
};

export default MyAccount;

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
    } = await user.findOneById(sessionValid.user.id);

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
