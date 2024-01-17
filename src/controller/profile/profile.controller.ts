import { FastifyInstance, FastifyRequest } from "fastify";
import { injectable } from "inversify";

import ProfileService from "@/application/usecase/profile/profile.service";
import { PrimaryKeySchemaForQuery } from "@/domain/schemas/base.schema";
import {
  ProfileInsertSchema,
  ProfileSelectSchema,
  ProfileUpdateSchema,
} from "@/domain/schemas/profile/profile.schema";

@injectable()
class ProfileController {
  private readonly profileService: ProfileService;

  constructor(fastify: FastifyInstance) {
    this.profileService = fastify.getFactory(ProfileService);
  }

  async create(request: FastifyRequest<{ Body: ProfileInsertSchema }>) {
    await this.profileService.create(request.body);
  }

  async get(
    request: FastifyRequest<{ Querystring: PrimaryKeySchemaForQuery }>,
  ): Promise<ProfileSelectSchema> {
    return this.profileService.get(request.query.id);
  }

  async getAll(): Promise<ProfileSelectSchema[]> {
    return this.profileService.getAll();
  }

  async update(request: FastifyRequest<{ Body: ProfileUpdateSchema }>) {
    await this.profileService.update(request.body);
  }

  async delete(
    request: FastifyRequest<{ Querystring: PrimaryKeySchemaForQuery }>,
  ) {
    await this.profileService.delete(request.query.id);
  }
}

export default ProfileController;
