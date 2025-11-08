import usersSchema from "./users/[userId]/routeSchema";
import rankingSchema from "./ranking/routeSchema";
import newsSchema from "./news/routeSchema";
import eventsSchema from "./events/routeSchema";
import apiKeysSchema from "./admin/api-keys/routeSchema";
import codesSchema from "./admin/codes/routeSchema";
import adminAnswersSchema from "./admin/answers/routeSchema";
import minecraftAuthorizeSchema from "./minecraft/[minecraftUsername]/authorize/routeSchema";
import minecraftIsAuthorizeSchema from "./minecraft/[minecraftUsername]/is-authorized/routeSchema";
import answersSchema from "./answers/[answerId]/routeSchema";

const schema = {
  ...usersSchema,
  ...rankingSchema,
  ...newsSchema,
  ...eventsSchema,
  ...apiKeysSchema,
  ...codesSchema,
  ...adminAnswersSchema,
  ...minecraftAuthorizeSchema,
  ...minecraftIsAuthorizeSchema,
  ...answersSchema,
};

export default schema;
