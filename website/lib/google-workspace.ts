import { google } from "googleapis";

export const getUserGroups = async (
  userEmail: string,
  serviceAccountEmail: string,
  privateKey: string
) => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/admin.directory.group.readonly"],
    clientOptions: {
      subject: "lucas.stephan@bde-epita.com",
    },
  });

  const admin = google.admin({ version: "directory_v1", auth });

  try {
    const groupsResponse = await admin.groups.list({
      userKey: userEmail,
    });

    return (
      (groupsResponse.data.groups?.map((g) => g.id).filter((id) => !!id) as string[]) ??
      []
    );
  } catch (error) {
    console.error("Error fetching Google Workspace data:", error);
    console.log(JSON.stringify(error));
    return [];
  }
};
