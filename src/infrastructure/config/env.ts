import * as dotenv from "dotenv";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
    };
  }
}

const schema = {
  type: "object",
  required: ["DATABASE_URL"],
  properties: {
    DATABASE_URL: {
      type: "string",
    },
  },
};

export const envOptions = () => {
  if (!process.env.NODE_ENV) {
    throw new Error("NODE_ENV is not defined.");
  }
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  return {
    schema,
    dotenv: true,
    confKey: "config",
    data: process.env,
  };
};
