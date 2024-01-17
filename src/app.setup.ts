import fastifyEnv from "@fastify/env";
import { FastifyInstance } from "fastify";

import {
  costomizePreHandler,
  costomizeErrorHandler,
  localizeValidationError,
} from "./domain/error/error.handler";
import { envOptions } from "./infrastructure/config/env";

const registerPlugins = async (fastify: FastifyInstance, plugins: any) => {
  await fastify.register(fastifyEnv, envOptions());
  const registerPromises = plugins.map((plugin: any) =>
    fastify.register(plugin),
  );
  await Promise.all(registerPromises);
};

const registerRoutes = async (fastify: FastifyInstance, routes: any) => {
  const registerPromises = routes.map(async (route: any) => {
    /* eslint new-cap: "off" */
    const router = new route();
    await fastify.register(router.routes, { prefix: router.prefixRoute });
  });
  await Promise.all(registerPromises);
};

export const setup = async (
  fastify: FastifyInstance,
  plugins: any,
  routes: any,
): Promise<void> => {
  costomizePreHandler(fastify);
  costomizeErrorHandler(fastify);
  await localizeValidationError();
  await registerPlugins(fastify, plugins);
  await registerRoutes(fastify, routes);
};
