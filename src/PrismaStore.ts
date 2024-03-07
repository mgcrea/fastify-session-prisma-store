import type { SessionData, SessionStore } from "@mgcrea/fastify-session";
import type { Prisma, PrismaClient } from "@prisma/client";
import { EventEmitter } from "events";
import { debug } from "./utils";

export type ExtraCreateInput<T extends SessionData = SessionData> = (
  data: T,
) => Partial<Prisma.SessionCreateInput>;

export type PrismaStoreOptions<T extends SessionData> = {
  prisma: PrismaClient;
  ttl?: number;
  extra?: ExtraCreateInput<T>;
};

export const DEFAULT_TTL = 864e2; // one day in seconds

export class PrismaStore<T extends SessionData = SessionData> extends EventEmitter implements SessionStore {
  private readonly ttl: number;
  readonly #extra: ExtraCreateInput<T> | undefined;
  readonly #prisma: PrismaClient;

  constructor({ prisma, ttl = DEFAULT_TTL, extra }: PrismaStoreOptions<T>) {
    super();
    debug(`new`, ttl);
    this.#prisma = prisma;
    this.#extra = extra;
    this.ttl = ttl;
  }

  private getExpiry(expiry?: number | null): Date {
    return new Date(expiry ?? Date.now() + this.ttl * 1000);
  }

  // This required method is used to upsert a session into the store given a session ID (sid) and session (session) object.
  async set(sessionId: string, sessionData: T, expiry?: number | null): Promise<void> {
    debug(`set`, sessionId, sessionData, expiry);
    // const ttl = expiry ? Math.min(expiry - Date.now(), this.ttl) : this.ttl;
    const expiresAt = this.getExpiry(expiry);
    const extra = this.#extra ? this.#extra(sessionData) : {};
    await this.#prisma.session.upsert({
      create: {
        ...extra,
        sid: sessionId,
        data: sessionData,
        expiresAt,
      },
      update: {
        data: sessionData,
        expiresAt,
      },
      where: {
        sid: sessionId,
      },
    });
    return;
  }

  // This required method is used to get a session from the store given a session ID (id).
  async get(sessionId: string): Promise<[SessionData, number | null] | null> {
    debug(`get`, sessionId);
    const value = await this.#prisma.session.findUnique({
      where: {
        sid: sessionId,
      },
    });
    return value?.data
      ? [value.data as Prisma.JsonObject, value.expiresAt ? value.expiresAt.getTime() : null]
      : null;
  }

  // This required method is used to destroy/delete a session from the store given a session ID (id).
  async destroy(sessionId: string): Promise<void> {
    debug(`destroy`, sessionId);
    await this.#prisma.session.delete({
      where: {
        sid: sessionId,
      },
    });
    return;
  }

  // This method is used to touch a session from the store given a session ID (id).
  async touch(sessionId: string, expiry?: number | null): Promise<void> {
    debug(`touch`, sessionId, expiry);
    // const ttl = expiry ? Math.min(expiry - Date.now(), this.ttl) : this.ttl;
    const session = await this.#prisma.session.findUnique({
      where: {
        sid: sessionId,
      },
    });
    if (!session) {
      return;
    }
    const expiresAt = this.getExpiry(expiry);
    await this.#prisma.session.update({
      where: {
        sid: sessionId,
      },
      data: {
        expiresAt,
      },
    });
    return;
  }
}
