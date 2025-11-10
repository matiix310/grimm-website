import { db } from "@/db";
import { links } from "@/db/schema/links";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const LinkPage = async (props: PageProps<"/to/[socialName]">) => {
  const params = await props.params;
  const socialName = params.socialName;

  const social = await db.query.links.findFirst({
    where: eq(links.name, socialName),
  });

  return redirect(social?.link ?? "/");
};

export default LinkPage;
