import { GetServerSideProps } from "next";

import { parse } from "cookie";

import AddPersonButton from "@/components/AddPersonButton";
import ErrorPage from "@/components/ErrorPage";
import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import session from "@/models/session";
import { usePerson, usePeople } from "@/swr/people";

import Loading from "./loading";
import Page from "./page";

const Users: React.FC = () => {
  const { isLoading, error } = usePeople();
  const { person } = usePerson();

  if (error && error.response?.status !== 401) return <ErrorPage />;

  return (
    <Layout
      label="Pessoas"
      rightAccessory={
        person && authorization.roleIsAdmin(person) ? <AddPersonButton /> : null
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

  if (!authorization.roleIsAdmin(sessionValid.person)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
};
