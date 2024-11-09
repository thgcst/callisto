import { GetServerSideProps } from "next";

import { parse } from "cookie";

import AddUserButton from "@/components/AddUserButton";
import ErrorPage from "@/components/ErrorPage";
import Layout from "@/components/Layout";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import session from "@/models/session";
import { useUsers } from "@/swr/users";

import Loading from "./loading";
import Page from "./page";

const Users: React.FC = () => {
  const { isLoading, error } = useUsers();
  const { user } = useUser();

  if (error && error.response?.status !== 401) return <ErrorPage />;

  return (
    <Layout
      label="Usuários"
      rightAccessory={
        user && authorization.can(user, `create:user`) ? (
          <AddUserButton />
        ) : null
      }
    >
      {isLoading ? <Loading /> : <Page />}
    </Layout>
  );
};
export default Users;

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

  if (!authorization.can(sessionValid.user, `read:users`)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
};
