import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";

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

  if (
    sessionValid &&
    authorization.can(sessionValid.user, `read:companyDetails`)
  ) {
    const approvedCompanies = await company.findAll({ approved: true });
    const companiesPendingApproval = await company.findAll({
      approved: false,
    });
    return {
      props: {
        detailedCompanies: {
          approvedCompanies: serialize(approvedCompanies),
          companiesPendingApproval: serialize(companiesPendingApproval),
        },
      },
    };
  }

  const companies = await company.findAllPublic();
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
      {detailedCompanies && <DetailedTable companies={detailedCompanies} />}
      {companies && <DefaultTable companies={companies} />}
    </Layout>
  );
};

export default Companies;
