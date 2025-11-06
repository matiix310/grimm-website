import usersSchema from "./users/[userId]/routeSchema";
import rankingSchema from "./ranking/routeSchema";
import newsSchema from "./news/routeSchema";
import eventsSchema from "./events/routeSchema";
import apiKeysSchema from "./admin/api-keys/routeSchema";
import codesSchema from "./admin/codes/routeSchema";

const schema = {
  ...usersSchema,
  ...rankingSchema,
  ...newsSchema,
  ...eventsSchema,
  ...apiKeysSchema,
  ...codesSchema,
};

export default schema;
