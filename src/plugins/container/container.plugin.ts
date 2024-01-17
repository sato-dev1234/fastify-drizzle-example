import "reflect-metadata";
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginAsync,
} from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { Container, interfaces } from "inversify";

import targets from "@/plugins/container";

const containerPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> => {
  const container = new Container();
  targets.forEach((targetClass) => {
    /* eslint new-cap: "off" */
    container
      .bind(Symbol.for(targetClass.name))
      .toDynamicValue(() => () => new targetClass(fastify))
      .inSingletonScope();
  });
  fastify.decorate("container", container);
  fastify.decorate(
    "getFactory",
    <TService>(targetClass: { name: string }): TService => {
      const factory = fastify.container.get<interfaces.Factory<TService>>(
        Symbol.for(targetClass.name),
      );
      return factory(fastify) as TService;
    },
  );
};

export default fastifyPlugin(containerPlugin, "4.x");
