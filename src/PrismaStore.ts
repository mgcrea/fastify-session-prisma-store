import {SessionData, SessionStore} from '@mgcrea/fastify-session';
import {Prisma, PrismaClient} from '@prisma/client';
import {EventEmitter} from 'events';
import {debug} from 'src/utils';

export type PrismaStoreOptions = {prisma: PrismaClient; ttl?: number};

export const DEFAULT_TTL = 864e2; // one day in seconds

export class PrismaStore<T extends SessionData = SessionData> extends EventEmitter implements SessionStore {
  private readonly ttl: number;
  readonly #prisma: PrismaClient;

  constructor({prisma, ttl = DEFAULT_TTL}: PrismaStoreOptions) {
    super();
    debug(`new`, ttl);
    this.#prisma = prisma;
    this.ttl = ttl;
  }

  private getExpires(expiry?: number | null): Date {
    return new Date(expiry ?? Date.now() + this.ttl * 1000);
  }

  // This required method is used to upsert a session into the store given a session ID (sid) and session (session) object.
  async set(sessionId: string, sessionData: T, expiry?: number | null): Promise<void> {
    debug(`set`, sessionId, sessionData, expiry);
    // const ttl = expiry ? Math.min(expiry - Date.now(), this.ttl) : this.ttl;
    const expires = this.getExpires(expiry);
    await this.#prisma.session.upsert({
      create: {
        sid: sessionId,
        data: sessionData,
        // user: {connect: {id: sessionData.userId as number}},
        expires,
      },
      update: {
        data: sessionData,
        // user: {connect: {id: sessionData.userId as number}},
        expires,
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
    return value?.data ? [value.data as Prisma.JsonObject, value.expires ? value.expires.getTime() : null] : null;
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
    const expires = this.getExpires(expiry);
    await this.#prisma.session.update({
      where: {
        sid: sessionId,
      },
      data: {
        expires,
      },
    });
    return;
  }
}
