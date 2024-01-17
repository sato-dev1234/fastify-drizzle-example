import { InferInsertModel, SQL } from "drizzle-orm";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { FastifyInstance } from "fastify";

import * as schema from "@/infrastructure/db/schema";

abstract class BaseRepository<TTable extends PgTable> {
  protected db: NodePgDatabase<typeof schema>;

  constructor(fastify: FastifyInstance) {
    this.db = drizzle(fastify.pg, { schema });
  }

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
