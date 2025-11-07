import usersSchema from "./users/[userId]/routeSchema";
import rankingSchema from "./ranking/routeSchema";
import newsSchema from "./news/routeSchema";
import eventsSchema from "./events/routeSchema";
import apiKeysSchema from "./admin/api-keys/routeSchema";
import codesSchema from "./admin/codes/routeSchema";
import minecraftAuthorize from "./minecraft/[minecraftUsername]/authorize/routeSchema";
import minecraftIsAuthorize from "./minecraft/[minecraftUsername]/is-authorized/routeSchema";

const schema = {
  ...usersSchema,
  ...rankingSchema,
  ...newsSchema,
  ...eventsSchema,
  ...apiKeysSchema,
  ...codesSchema,
  ...minecraftAuthorize,
  ...minecraftIsAuthorize,
};

export default schema;
