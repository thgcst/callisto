import React from "react";

import { GetServerSideProps } from "next";

import { User } from "@prisma/client";
import { parse } from "cookie";

import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import session from "@/models/session";
import user from "@/models/user";

import EditUser from "./EditUser";
import Sessions from "./Sessions";

type UserDetailsProps = {
  user: Omit<User, "password">;
};

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  return (
    <Layout label={user.name}>
      <EditUser user={user} />
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>
      <Sessions />
    </Layout>
  );
};

export default UserDetails;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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

  if (!authorization.can(sessionValid.user, "read:users")) {
    return {
      notFound: true,
    };
  }

  const userId = ctx.params?.userId as string;

  let userObject;
  try {
    userObject = await user.findOneById(userId);
  } catch (err) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user: JSON.parse(
        JSON.stringify({
          ...userObject,
          password: undefined,
        })
      ),
    },
  };
};
