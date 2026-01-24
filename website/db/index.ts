import { drizzle } from "drizzle-orm/node-postgres";
import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import { getEnvOrThrow } from "@/lib/env";

import * as auth from "./schema/auth";
import * as events from "./schema/events";
import * as news from "./schema/news";
import * as points from "./schema/points";
import * as pointTags from "./schema/pointTags";
import * as minecraftUsernames from "./schema/minecraftUsernames";
import * as ranking from "./schema/ranking";
import * as redeemCodes from "./schema/redeemCodes";
import * as redeemUsers from "./schema/redeemUsers";
import * as bureau from "./schema/bureau";
import * as minecraftAuthorizations from "./schema/minecraftAuthorizations";
import * as answers from "./schema/answers";
import * as answerUsers from "./schema/answerUsers";
import * as presets from "./schema/presets";
import * as links from "./schema/links";
import * as adventCalendar from "./schema/adventCalendar";

const DB_PASSWORD = getEnvOrThrow("DB_PASSWORD");

const schema = {
  ...auth,
  ...events,
  ...news,
  ...points,
  ...pointTags,
  ...minecraftUsernames,
  ...ranking,
  ...redeemCodes,
  ...redeemUsers,
  ...bureau,
  ...minecraftAuthorizations,
  ...answers,
  ...answerUsers,
  ...presets,
  ...links,
  ...adventCalendar,
} as const;

export const db = drizzle("postgres://postgres:" + DB_PASSWORD + "@db:5432/grimm", {
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
