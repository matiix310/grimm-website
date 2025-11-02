import usersSchema from "./users/[userId]/routeSchema";
import rankingSchema from "./ranking/routeSchema";
import newsSchema from "./news/routeSchema";
import apiKeysSchema from "./admin/api-keys/routeSchema";

const schema = {
  ...usersSchema,
  ...rankingSchema,
  ...newsSchema,
  ...apiKeysSchema,
};

export default schema;
