import { FastifyInstance, FastifyError } from "fastify";
import i18next from "i18next";
import { ZodError, ZodIssue, z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/ja/zod.json";

import { ValidationError } from "./validation.error";

export const costomizePreHandler = (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", (request, _reply, done) => {
    if (request.body) {
      request.log.info({ body: request.body }, "parsed body");
    }
    done();
  });
};

export const costomizeErrorHandler = (fastify: FastifyInstance) => {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    request.log.error(error);
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      const issues = zodError.issues.map((issue: ZodIssue) => ({
        message: issue.message,
        path: issue.path,
      }));
      const validationError = new ValidationError(
        error.code,
        "Bad Request",
        issues,
        error.statusCode,
      );
      await reply.status(400).send(validationError);
      return;
    }
    await reply.send(error);
  });
};

export const localizeValidationError = async () => {
  await i18next.init({
    lng: "ja",
    resources: {
      ja: { zod: translation },
    },
  });
  z.setErrorMap(zodI18nMap);
};
