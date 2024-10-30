import { NextApiRequest } from "next";

import { Session, User } from "@prisma/client";

type InjectedRequest = NextApiRequest & {
  context: {
    user: User;
    session: Session;
  };
};

export default InjectedRequest;
