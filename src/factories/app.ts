import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";

export interface ApplicationOptions {
  port: number;
  host?: string;
  backlog?: number;
}

class App {
  public fastify: FastifyInstance;

  constructor(
    private readonly options: ApplicationOptions = { port: 3000 },
    private readonly fastifyOptions: FastifyServerOptions = { logger: true },
  ) {
    this.fastify = fastify(this.fastifyOptions);
    this.fastify.setValidatorCompiler(validatorCompiler);
    this.fastify.setSerializerCompiler(serializerCompiler);
  }

  async listen() {
    return this.fastify.listen(this.options);
  }
}

export default App;
