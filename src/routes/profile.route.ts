import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";

import ProfileController from "@/controller/profile/profile.controller";
import {
  PrimaryKeySchemaForQuery,
  primaryKeySchemaForQuery,
} from "@/domain/schemas/base.schema";
import {
  ProfileInsertSchema,
  ProfileSelectSchema,
  ProfileUpdateSchema,
  profileInsertSchema,
  profileUpdateSchema,
} from "@/domain/schemas/profile/profile.schema";
import { classToSymbol } from "@/plugins/container/types";

class ProfileRoute {
  public prefixRoute = "/profile";

  async routes(
    fastify: FastifyInstance,
    _options: FastifyPluginOptions,
  ): Promise<void> {
    const profileController: ProfileController =
      fastify.container.get<ProfileController>(
        classToSymbol(ProfileController),
      );

    fastify.post(
      "/create",
      {
        schema: {
          body: profileInsertSchema,
        },
      },
      async (request: FastifyRequest<{ Body: ProfileInsertSchema }>, reply) => {
        await profileController.create(request);
        return reply.code(201).send();
      },
    );

    fastify.get(
      "/get",
      {
        schema: { querystring: primaryKeySchemaForQuery },
      },
      async (
        request: FastifyRequest<{ Querystring: PrimaryKeySchemaForQuery }>,
        reply,
      ) => {
        const profile: ProfileSelectSchema =
          await profileController.get(request);
        return reply.code(200).send({ profile });
      },
    );

    fastify.get("/getAll", async (_request, reply) => {
      const profile: ProfileSelectSchema[] = await profileController.getAll();
      return reply.code(200).send({ profile });
    });

    fastify.put(
      "/update",
      {
        schema: { body: profileUpdateSchema },
      },
      async (request: FastifyRequest<{ Body: ProfileUpdateSchema }>, reply) => {
        await profileController.update(request);
        return reply.code(204).send();
      },
    );

    fastify.delete(
      "/delete",
      {
        schema: { querystring: primaryKeySchemaForQuery },
      },
      async (
        request: FastifyRequest<{ Querystring: PrimaryKeySchemaForQuery }>,
        reply,
      ) => {
        await profileController.delete(request);
        return reply.code(204).send();
      },
    );
  }
}

export default ProfileRoute;
