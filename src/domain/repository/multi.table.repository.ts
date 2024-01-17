/* eslint class-methods-use-this: "off" */
import {
  ExtractTablesWithRelations,
  InferInsertModel,
  InferSelectModel,
  SQL,
} from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTable, PgTransaction, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { QueryResult } from "pg";

import * as schema from "@/infrastructure/db/schema";

interface MultiTableRepository {
  insert<TTable extends PgTable>(
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
  >;

  update<TTable extends PgTable>(
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
  >;
}
export default MultiTableRepository;
