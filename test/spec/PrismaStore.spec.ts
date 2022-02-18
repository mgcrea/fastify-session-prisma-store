/* eslint-disable */
import {PrismaClient} from '@prisma/client';
import {PrismaStore} from 'src/PrismaStore';
import {getSessionWithId, prisma, waitFor} from 'test/utils';

const TTL = 120;
const SHORT_TTL = 12;
const WAIT_FOR = 200;

describe('PrismaStore', () => {
  const store = new PrismaStore({prisma, ttl: TTL});
  const minExpiry = Date.now();
  const context = new Map<string, any>([
    ['id', 'QLwqf4XJ1dmkiT41RB0fM'],
    ['data', {foo: 'bar'}],
  ]);

  afterAll(() => {
    prisma.$disconnect();
  });

  it('should properly set a key', async () => {
    const result = await store.set(context.get('id'), context.get('data'));
    expect(result).toBeUndefined();
    const sessionData = await getSessionWithId(context.get('id'));
    expect(sessionData.data).toEqual(context.get('data'));
    expect(sessionData.expires).toBeInstanceOf(Date);
    expect(sessionData.expires.getTime()).toBeLessThan(Date.now() + TTL * 1000);
  });

  it('should properly set a key with a shorter expiry', async () => {
    const result = await store.set(context.get('id'), context.get('data'), Date.now() + SHORT_TTL * 1e3);
    expect(result).toBeUndefined();
    const sessionData = await getSessionWithId(context.get('id'));
    expect(sessionData.data).toEqual(context.get('data'));
    expect(sessionData.expires).toBeInstanceOf(Date);
    expect(sessionData.expires.getTime()).toBeLessThan(Date.now() + SHORT_TTL * 1000);
  });

  it('should properly get a key', async () => {
    const result = await store.get(context.get('id'));
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result![0]).toEqual(context.get('data'));
    expect(result![1] && result![1] > minExpiry).toBeTruthy();
  });

  it('should properly destroy a key', async () => {
    const result = await store.destroy(context.get('id'));
    expect(result).toBeUndefined();
    const result2 = await store.get(context.get('id'));
    expect(result2).toBe(null);
  });

  it('should properly touch a key', async () => {
    await store.set(context.get('id'), context.get('data'));
    await waitFor(WAIT_FOR);
    const {expires: beforeExpires} = await getSessionWithId(context.get('id'));
    const result = await store.touch(context.get('id'));
    expect(result).toBeUndefined();
    const {expires: afterExpires} = await getSessionWithId(context.get('id'));
    expect(afterExpires.getTime()).toBeGreaterThan(beforeExpires.getTime() + WAIT_FOR);
  });

  it('should properly touch a key with a shorter expiry', async () => {
    await store.set(context.get('id'), context.get('data'));
    await waitFor(WAIT_FOR);
    const {expires: beforeExpires} = await getSessionWithId(context.get('id'));
    const result = await store.touch(context.get('id'), Date.now() + SHORT_TTL * 1e3);
    expect(result).toBeUndefined();
    const {expires: afterExpires} = await getSessionWithId(context.get('id'));
    expect(afterExpires.getTime()).toBeLessThan(beforeExpires.getTime());
  });
});
