import { google } from "googleapis";

export async function getSheetData(
  spreadsheetId: string,
  range: string,
  serviceAccountEmail: string,
  privateKey: string
) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    console.log(JSON.stringify(error));
    throw error;
  }
}
