# FastifySession PrismaStore

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-prisma-store">
    <img src="https://img.shields.io/npm/v/@mgcrea/fastify-session-prisma-store.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-prisma-store">
    <img src="https://img.shields.io/npm/dt/@mgcrea/fastify-session-prisma-store.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-prisma-store">
    <img src="https://img.shields.io/npm/dm/@mgcrea/fastify-session-prisma-store.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-prisma-store">
    <img src="https://img.shields.io/npm/l/@mgcrea/fastify-session-prisma-store.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/fastify-session-prisma-store/actions/workflows/main.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/fastify-session-prisma-store/main.yml?style=for-the-badge&branch=master" alt="build status" />
  </a>
  <a href="https://depfu.com/github/mgcrea/fastify-session-prisma-store">
    <img src="https://img.shields.io/depfu/dependencies/github/mgcrea/fastify-session-prisma-store?style=for-the-badge" alt="dependencies status" />
  </a>
</p>
<!-- markdownlint-enable MD037 -->

## Features

[Prisma](https://prisma.io) session store for [fastify](https://github.com/fastify/fastify).

- Requires [@mgcrea/fastify-session](https://github.com/mgcrea/fastify-session) to handle sessions.
- Written in [TypeScript](https://www.typescriptlang.org/) for static type checking with exported types along the library.
- Built by [tsup](https://tsup.egoist.dev) to provide both CommonJS and ESM packages.

## Install

```bash
npm install fastify-cookie @mgcrea/fastify-session @mgcrea/fastify-session-prisma-store
# or
pnpm add fastify-cookie @mgcrea/fastify-session @mgcrea/fastify-session-prisma-store
```

## Quickstart

```ts
import createFastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import fastifyCookie from "fastify-cookie";
import PrismaStore from "@mgcrea/fastify-session-prisma-store";
import fastifySession from "@mgcrea/fastify-session";
import { prisma } from "./config/prisma";

const SESSION_TTL = 864e3; // 1 day in seconds

export const buildFastify = (options?: FastifyServerOptions): FastifyInstance => {
  const fastify = createFastify(options);

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    store: new PrismaStore({ prisma }),
    secret: "a secret with minimum length of 32 characters",
    cookie: { maxAge: SESSION_TTL },
  });

  return fastify;
};
```

## Debug

You can use the `DEBUG` environment variable to toggle the [debug](https://github.com/debug-js/debug) output for this package:

```sh
DEBUG=fastify-session-prisma-store npm start
```

## Authors

- [Olivier Louvignes](https://github.com/mgcrea) <<olivier@mgcrea.io>>

## License

```txt
The MIT License

Copyright (c) 2023 Olivier Louvignes <olivier@mgcrea.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
