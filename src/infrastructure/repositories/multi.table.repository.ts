/* eslint class-methods-use-this: "off" */
import {
  ExtractTablesWithRelations,
  InferInsertModel,
  InferSelectModel,
  SQL,
} from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTable, PgTransaction, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { injectable } from "inversify";
import { QueryResult } from "pg";

import MultiTableRepository from "@/domain/repositories/multi.table.repository";
import * as schema from "@/infrastructure/db/schema";

@injectable()
class MultiTableRepositoryImpl implements MultiTableRepository {
  async insert<TTable extends PgTable>(
    tx: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    table: TTable,
    entity: InferInsertModel<TTable>,
  ): Promise<
    InferSelectModel<TTable> extends undefined
      ? QueryResult<never>
      : InferSelectModel<TTable>[]
  > {
    return tx.insert(table).values(entity).returning();
  }

  async update<TTable extends PgTable>(
    tx: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    table: TTable,
    value: PgUpdateSetSource<TTable>,
    condition?: SQL | undefined,
  ): Promise<
    InferSelectModel<TTable> extends undefined
      ? QueryResult<never>
      : InferSelectModel<TTable>[]
  > {
    return tx.update(table).set(value).where(condition).returning();
  }
}

export default MultiTableRepositoryImpl;
