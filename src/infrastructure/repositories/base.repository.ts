import { InferInsertModel, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { inject, injectable } from "inversify";

import * as schema from "@/infrastructure/db/schema";
import { TYPES } from "@/plugins/container/types";

@injectable()
abstract class BaseRepository<TTable extends PgTable> {
  @inject(TYPES.DB) protected db: NodePgDatabase<typeof schema>;

  async insert(table: TTable, entity: InferInsertModel<TTable>) {
    return this.db.insert(table).values(entity);
  }

  async select(table: TTable, condition?: SQL | undefined) {
    return this.db.select().from<TTable>(table).where(condition);
  }

  async update(
    table: TTable,
    value: PgUpdateSetSource<TTable>,
    condition?: SQL | undefined,
  ) {
    return this.db.update(table).set(value).where(condition).returning();
  }
}

export default BaseRepository;
