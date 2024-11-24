import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";

import AddIndividualButton from "@/components/AddIndividualButton";
import Layout from "@/components/Layout";
import authorization from "@/models/authorization";
import individual from "@/models/individual";
import session from "@/models/session";
import { serialize } from "@/utils/serialize";

import DefaultTable from "./defaultTable";
import DetailedTable from "./detailedTable";

export const getServerSideProps = (async (ctx) => {
  const { sessionToken } = parse(ctx.req.headers.cookie || "");

  const sessionValid = await session.isSessionValid(sessionToken);

  if (
    sessionValid &&
    authorization.can(sessionValid.user, `read:individualDetails`)
  ) {
    const approvedIndividuals = await individual.findAll({ approved: true });
    const individualsPendingApproval = await individual.findAll({
      approved: false,
    });
    return {
      props: {
        detailedIndividuals: {
          approvedIndividuals: serialize(approvedIndividuals),
          individualsPendingApproval: serialize(individualsPendingApproval),
        },
      },
    };
  }

  const individuals = await individual.findAllPublic();
  return {
    props: {
      individuals: serialize(individuals),
    },
  };
}) satisfies GetServerSideProps;

export type IndividualsProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Individuals: React.FC<IndividualsProps> = ({
  individuals,
  detailedIndividuals,
}) => {
  return (
    <Layout label="Pessoas" rightAccessory={<AddIndividualButton />}>
      {detailedIndividuals && (
        <DetailedTable individuals={detailedIndividuals} />
      )}
      {individuals && <DefaultTable individuals={individuals} />}
    </Layout>
  );
};

export default Individuals;
