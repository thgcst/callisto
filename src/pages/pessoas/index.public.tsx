import { GetServerSideProps } from "next";

import { parse } from "cookie";

import AddUserButton from "@/components/AddUserButton";
import ErrorPage from "@/components/ErrorPage";
import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import session from "@/models/session";
import { useMe, useUsers } from "@/swr/users";

import Loading from "./loading";
import Page from "./page";

const Users: React.FC = () => {
  const { isLoading: notApprovedLoading, error: notApprovedError } = useUsers({
    approved: false,
  });
  const { isLoading: approvedLoading, error: approvedError } = useUsers({
    approved: true,
  });
  const { me } = useMe();

  if (approvedError || notApprovedError) return <ErrorPage />;

  const isLoading = notApprovedLoading || approvedLoading;

  return (
    <Layout
      label="Pessoas"
      rightAccessory={
        me && authorization.roleIsAdmin(me) ? <AddUserButton /> : null
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

  return {
    props: {},
  };
};
