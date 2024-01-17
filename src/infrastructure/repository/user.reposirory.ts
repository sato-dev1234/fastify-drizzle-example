import { SQL, and, eq, isNull } from "drizzle-orm";
import { injectable } from "inversify";

import BaseRepository from "./base.repository";

import UserRepository from "@/domain/repository/user.reposirory";
import {
  ProfileSelectSchema,
  toUserSelectSchema,
  toUserSelectSchemas,
} from "@/domain/schemas/profile/profile.schema";
import { contact, user } from "@/infrastructure/db/schema";
import { User, UserWithRelations } from "@/infrastructure/db/user.schema";

@injectable()
class UserRepositoryImpl
  extends BaseRepository<User>
  implements UserRepository
{
  async findMany(
    userCondition?: SQL | undefined,
    contactCondition?: SQL | undefined,
  ): Promise<ProfileSelectSchema[]> {
    const entities = await this.db.query.user.findMany({
      where: and(isNull(user.deletedAt), userCondition),
      with: {
        contacts: {
          where: and(isNull(contact.deletedAt), contactCondition),
        },
      },
    });
    if (entities == undefined) {
      return [];
    }
    return toUserSelectSchemas(entities);
  }

  async findFirst(userId: number): Promise<ProfileSelectSchema | undefined> {
    const entity: UserWithRelations | undefined =
      await this.db.query.user.findFirst({
        where: and(isNull(user.deletedAt), eq(user.id, userId)),
        with: {
          contacts: {
            where: and(isNull(contact.deletedAt)),
          },
        },
      });
    if (entity == undefined) {
      return undefined;
    }
    return toUserSelectSchema(entity);
  }
}

export default UserRepositoryImpl;
