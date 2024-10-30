import { NextApiRequest } from "next";

import { Session, Person } from "@prisma/client";

type InjectedRequest = NextApiRequest & {
  context: {
    person: Person;
    session: Session;
  };
};

export default InjectedRequest;
