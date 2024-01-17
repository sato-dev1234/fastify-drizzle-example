import { SQL } from "drizzle-orm";

import { ProfileSelectSchema } from "../schemas/profile/profile.schema";

interface UserRepository {
  findMany(
    userCondition?: SQL | undefined,
    contactCondition?: SQL | undefined,
  ): Promise<ProfileSelectSchema[]>;

  findFirst(userId: number): Promise<ProfileSelectSchema | undefined>;
}
export default UserRepository;
