import { and, eq, isNull } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { errorCodes } from "fastify";
import { inject, injectable } from "inversify";

import MultiTableRepository from "@/domain/repositories/multi.table.repository";
import UserRepository from "@/domain/repositories/user.reposirory";
import {
  ContactInsertSchema,
  ContactUpdateSchema,
} from "@/domain/schemas/contact/contact.schema";
import {
  ProfileInsertSchema,
  ProfileSelectSchema,
  ProfileUpdateSchema,
} from "@/domain/schemas/profile/profile.schema";
import {
  UserInsertSchema,
  UserUpdateSchema,
} from "@/domain/schemas/user/user.schema";
import { Contact, NewContact } from "@/infrastructure/db/contact.schema ";
import { user, contact } from "@/infrastructure/db/schema";
import * as schema from "@/infrastructure/db/schema";
import { UserEntity, User } from "@/infrastructure/db/user.schema";
import MultiTableRepositoryImpl from "@/infrastructure/repositories/multi.table.repository";
import UserRepositoryImpl from "@/infrastructure/repositories/user.reposirory";
import { TYPES, classToSymbol } from "@/plugins/container/types";

@injectable()
class ProfileService {
  @inject(TYPES.DB)
  private db: NodePgDatabase<typeof schema>;

  @inject(classToSymbol(MultiTableRepositoryImpl))
  private readonly multiTableRepository: MultiTableRepository;

  @inject(classToSymbol(UserRepositoryImpl))
  private readonly userRepository: UserRepository;

  async create(profileInsertSchema: ProfileInsertSchema): Promise<void> {
    const userSchema: UserInsertSchema = profileInsertSchema.user;
    const contactSchemas: ContactInsertSchema[] = profileInsertSchema.contacts;
    await this.db.transaction(async (tx) => {
      const newUser = {
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
      };
      const [registeredUser]: UserEntity[] =
        await this.multiTableRepository.insert<User>(tx, user, newUser);
      await Promise.all(
        contactSchemas.map(async ({ phoneNumber, email }) => {
          const newContact: NewContact = {
            phoneNumber,
            email,
            userId: registeredUser.id,
          };
          await this.multiTableRepository.insert<Contact>(
            tx,
            contact,
            newContact,
          );
        }),
      );
    });
  }

  async get(userId: number): Promise<ProfileSelectSchema> {
    const profile = await this.userRepository.findFirst(userId);
    if (!profile) {
      throw new errorCodes.FST_ERR_NOT_FOUND();
    }
    return profile;
  }

  async getAll(): Promise<ProfileSelectSchema[]> {
    return this.userRepository.findMany();
  }

  async update(profileUpdateSchema: ProfileUpdateSchema): Promise<void> {
    const profile = await this.userRepository.findFirst(
      profileUpdateSchema.user.id,
    );
    if (!profile) {
      throw new errorCodes.FST_ERR_NOT_FOUND();
    }
    const userSchema: UserUpdateSchema = profileUpdateSchema.user;
    const contactSchemas: ContactUpdateSchema[] = profileUpdateSchema.contacts;
    await this.db.transaction(async (tx) => {
      const userEntity = {
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
      };
      const userCondition = and(
        eq(user.id, userSchema.id),
        isNull(user.deletedAt),
      );
      await this.multiTableRepository.update<User>(
        tx,
        user,
        userEntity,
        userCondition,
      );
      await Promise.all(
        contactSchemas.map(async ({ id, phoneNumber, email }) => {
          const contactEntity = { phoneNumber, email };
          const contactCondition = and(
            eq(contact.id, id),
            isNull(contact.deletedAt),
          );
          await this.multiTableRepository.update<Contact>(
            tx,
            contact,
            contactEntity,
            contactCondition,
          );
        }),
      );
    });
  }

  async delete(userId: number, deletedAt: Date = new Date()): Promise<void> {
    const userEntity = await this.userRepository.findFirst(userId);
    if (!userEntity) {
      throw new errorCodes.FST_ERR_NOT_FOUND();
    }
    await this.db.transaction(async (tx) => {
      const userCondition = and(eq(user.id, userId), isNull(user.deletedAt));
      await this.multiTableRepository.update<User>(
        tx,
        user,
        { deletedAt },
        userCondition,
      );
      await Promise.all(
        userEntity.contacts.map(async (entity) => {
          const contactEntity: PgUpdateSetSource<Contact> = { deletedAt };
          const contactCondition = and(
            eq(contact.id, entity.id),
            isNull(contact.deletedAt),
          );
          await this.multiTableRepository.update<Contact>(
            tx,
            contact,
            contactEntity,
            contactCondition,
          );
        }),
      );
    });
  }
}

export default ProfileService;
