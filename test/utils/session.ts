import assert from "assert";
import { prisma } from "./client";

export const getSessionWithId = async (sid: string) => {
  const session = await prisma.session.findUnique({ where: { sid } });
  assert(session, `Session with sid=${sid} not found`);
  return session;
};
