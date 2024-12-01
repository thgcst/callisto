import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";

import EditAddress from "@/components/EditAddress";
import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import individual from "@/models/individual";
import session from "@/models/session";
import { serialize } from "@/utils/serialize";

import EditIndividual from "./EditIndividual";

export type IndividualPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

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

  if (!authorization.can(sessionValid.user, "read:individual")) {
    return {
      notFound: true,
    };
  }

  const individualId = ctx.params?.individualId as string;

  let individualObject;
  try {
    individualObject = await individual.findOneById(individualId);
  } catch {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      individual: serialize(individualObject),
    },
  };
}) satisfies GetServerSideProps;

export default function IndividualPage({ individual }: IndividualPageProps) {
  return (
    <Layout title={individual.name} label={individual.name}>
      <EditIndividual individual={individual} />
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>
      <EditAddress address={individual.address} />
    </Layout>
  );
}
