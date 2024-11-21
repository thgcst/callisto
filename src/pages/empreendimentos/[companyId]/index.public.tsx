import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";

import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import company from "@/models/company";
import session from "@/models/session";
import { serialize } from "@/utils/serialize";

type CompanyPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function CompanyPage({ company }: CompanyPageProps) {
  return <Layout title={company.name} label={company.name}></Layout>;
}

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

  if (!authorization.can(sessionValid.user, "read:company")) {
    return {
      notFound: true,
    };
  }

  const companyId = ctx.params?.companyId as string;

  let companyObject;
  try {
    companyObject = await company.findOneById(companyId);
  } catch {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      company: serialize(companyObject),
    },
  };
}) satisfies GetServerSideProps;
