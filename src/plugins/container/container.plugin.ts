import "reflect-metadata";
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginAsync,
} from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { Container } from "inversify";

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
      .to(targetClass)
      .inSingletonScope();
  });

  fastify.decorate("container", container);
};

export default fastifyPlugin(containerPlugin, "4.x");
