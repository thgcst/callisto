import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";
import * as z from "zod";

import AddCompanyButton from "@/components/AddCompanyButton";
import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import company from "@/models/company";
import session from "@/models/session";
import { serialize } from "@/utils/serialize";

import DefaultTable from "./defaultTable";
import DetailedTable from "./detailedTable";

export const getServerSideProps = (async (ctx) => {
  const { sessionToken } = parse(ctx.req.headers.cookie || "");

  const sessionValid = await session.isSessionValid(sessionToken);

  const querySchema = z.object({
    page: z.coerce.number().optional(),
    tab: z.union([z.literal("pendente"), z.literal("aprovados")]).optional(),
  });

  const { page = 1, tab = "aprovados" } = querySchema.parse(ctx.query);

  if (
    sessionValid &&
    authorization.can(sessionValid.user, `read:companyDetails`)
  ) {
    return {
      props: {
        detailedCompanies: serialize(
          await company.findAllPaginated({
            approved: tab === "aprovados",
            page: page,
          }),
        ),
      },
    };
  }

  const companies = await company.findAllPublicPaginated({ page });
  return {
    props: {
      companies: serialize(companies),
    },
  };
}) satisfies GetServerSideProps;

export type CompaniesProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Companies: React.FC<CompaniesProps> = ({
  companies,
  detailedCompanies,
}) => {
  return (
    <Layout label="Empreendimentos" rightAccessory={<AddCompanyButton />}>
      {detailedCompanies && (
        <DetailedTable
          companies={detailedCompanies[0]}
          meta={detailedCompanies[1]}
        />
      )}
      {companies && (
        <DefaultTable companies={companies[0]} meta={companies[1]} />
      )}
    </Layout>
  );
};

export default Companies;
