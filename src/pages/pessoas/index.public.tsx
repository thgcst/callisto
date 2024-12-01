import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { parse } from "cookie";
import * as z from "zod";

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

  const querySchema = z.object({
    page: z.coerce.number().optional(),
    tab: z.union([z.literal("pendente"), z.literal("aprovados")]).optional(),
  });

  const { page = 1, tab = "aprovados" } = querySchema.parse(ctx.query);

  if (
    sessionValid &&
    authorization.can(sessionValid.user, `read:individualDetails`)
  ) {
    return {
      props: {
        detailedIndividuals: serialize(
          await individual.findAllPaginated({
            approved: tab === "aprovados",
            page: page,
          }),
        ),
      },
    };
  }

  const individuals = await individual.findAllPublicPaginated({ page });
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
        <DetailedTable
          individuals={detailedIndividuals[0]}
          meta={detailedIndividuals[1]}
        />
      )}
      {individuals && (
        <DefaultTable individuals={individuals[0]} meta={individuals[1]} />
      )}
    </Layout>
  );
};

export default Individuals;
