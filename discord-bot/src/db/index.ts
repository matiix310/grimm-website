import { drizzle } from "drizzle-orm/node-postgres";
import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import * as discordRolesSchema from "./schema/discord-roles";
import * as discordLogChannelSchema from "./schema/discord-log-channel";

if (process.env.DB_URL === undefined)
  throw new Error("Environement variable DB_URL is not defined!");

const schema = {
  ...discordRolesSchema,
  ...discordLogChannelSchema,
};

export const db = drizzle(process.env.DB_URL, {
  schema,
});

type Schema = typeof schema;
type TablesWithRelations = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TablesWithRelations> = DBQueryConfig<
  "one" | "many",
  boolean,
  TablesWithRelations,
  TablesWithRelations[TableName]
>["with"];

export type IncludeColumns<TableName extends keyof TablesWithRelations> = DBQueryConfig<
  "one" | "many",
  boolean,
  TablesWithRelations,
  TablesWithRelations[TableName]
>["columns"];

export type InferQueryModel<
  TableName extends keyof TablesWithRelations,
  With extends IncludeRelation<TableName> | undefined = undefined,
  Columns extends IncludeColumns<TableName> | undefined = undefined
> = {
  [K in keyof BuildQueryResult<
    TablesWithRelations,
    TablesWithRelations[TableName],
    {
      columns: Columns;
      with: With;
    }
  >]: K extends keyof With
    ? With[K] extends { __optional: true }
      ?
          | BuildQueryResult<
              TablesWithRelations,
              TablesWithRelations[TableName],
              {
                columns: Columns;
                with: With;
              }
            >[K]
          | undefined
      : BuildQueryResult<
          TablesWithRelations,
          TablesWithRelations[TableName],
          {
            columns: Columns;
            with: With;
          }
        >[K]
    : BuildQueryResult<
        TablesWithRelations,
        TablesWithRelations[TableName],
        {
          columns: Columns;
          with: With;
        }
      >[K];
};
