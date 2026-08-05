import { drizzle } from "drizzle-orm/node-postgres";
import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import * as discordRolesSchema from "./schema/discord-roles";
import * as discordLogChannelSchema from "./schema/discord-log-channel";
import { getEnvOrThrow } from "../libs/env";

const schema = {
  ...discordRolesSchema,
  ...discordLogChannelSchema,
};

const DB_NAME = getEnvOrThrow("DB_NAME");
const DB_HOST = getEnvOrThrow("DB_HOST");
const DB_PASSWORD = getEnvOrThrow("DB_PASSWORD");
const DB_PORT = getEnvOrThrow("DB_PORT");
const DB_USER = getEnvOrThrow("DB_USER");

export const db = drizzle(
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    schema,
  },
);

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
  Columns extends IncludeColumns<TableName> | undefined = undefined,
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
