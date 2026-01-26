import { google } from "googleapis";
import nodemailer from "nodemailer";
import { getEnvOrThrow } from "./env";

export const sendMail = async (
  toEmail: string,
  fromEmail: string,
  fromName: string,
  subject: string,
  textContent: string,
  htmlContent: string,
) => {
  const serviceAccountEmail = getEnvOrThrow("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getEnvOrThrow("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const jwtClient = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://mail.google.com/"],
    subject: fromEmail,
  });

  try {
    const accessTokenObj = await jwtClient.getAccessToken();
    const accessToken = accessTokenObj.token;

    if (!accessToken) {
      throw new Error("Failed to generate access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: fromEmail,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { error: false, result };
  } catch (error) {
    return { error: true, result: error };
  }
};
