import { db } from "@/db";
import { promoCodes } from "@/db/schema/promoCodes";
import ApiResponse from "@/lib/apiResponse";
import { sendMail } from "@/lib/sendMail";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "";

  const haServers = {
    "4.233.135.234": "Test",
    "89.117.104.53": "Production",
  };

  console.log("Request received from ", ip);

  console.log(await request.json());

  if (!(ip in haServers)) {
    return ApiResponse.unauthorized();
  }

  const haServer = haServers[ip as keyof typeof haServers];

  console.log("Identified server:", haServer);

  // TODO : get the sender name from the ha notification
  const senderName = "Cupidon";

  const promoCode = await db.transaction(async (tx) => {
    const code = await tx.query.promoCodes.findFirst({
      where: eq(promoCodes.used, false),
    });

    if (!code) return undefined;

    await tx.update(promoCodes).set({ used: true }).where(eq(promoCodes.code, code.code));

    return code;
  });

  if (promoCode === undefined) {
    // TODO : send a discord notification with all the context
    return ApiResponse.internalServerError("No promo code available");
  }

  const ticketLink =
    "https://www.helloasso.com/associations/bde-epita/evenements/aphrodisiac-under-14-02";

  const textContent = `
Salut !

${senderName} t'offre une place DUO pour la Soirée Aphrodisiac organisée par le BDE Grimm !

Voici ton code promo exclusif pour obtenir ta place DUO offerte : ${promoCode}

Utilise ce lien pour prendre ta place : ${ticketLink}

À très vite,
L'équipe du BDE Grimm
    `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; background-color: #121212; }
  </style>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #121212; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6200ea, #b00020); padding: 40px 20px; text-align: center;">
       <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">Soirée Aphrodisiac</h1>
       <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.8; font-weight: 500;">BDE GRIMM &bull; EPITA</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; text-align: left;">
       <h2 style="color: #ff4081; margin-top: 0; font-size: 24px;">Une surprise t'attend ! 🎁</h2>
       
       <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px;">
         Salut !
       </p>
       <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">
         <strong>${senderName}</strong> t'offre une <strong>place DUO</strong> pour la soirée la plus attendue de l'année. Prépare-toi à une ambiance électrique !
       </p>
       
       <!-- Promo Code Box -->
       <div style="background-color: #252525; border: 2px dashed #ff4081; padding: 20px; margin: 30px 0; text-align: center; border-radius: 8px;">
         <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Ton Code Promo</p>
         <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #ffffff; display: block;">${promoCode}</span>
       </div>

       <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center; margin-bottom: 30px;">
         Utilise ce code sur la billetterie pour valider ta place offerte.
       </p>

       <!-- CTA Button -->
       <div style="text-align: center; margin-bottom: 20px;">
         <a href="${ticketLink}" style="background-color: #ff4081; color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4); transition: transform 0.2s;">
           Réserver ma place
         </a>
       </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #181818; padding: 20px; text-align: center; border-top: 1px solid #333;">
      <p style="margin: 0; font-size: 12px; color: #666;">Envoyé avec ❤️ par le BDE Grimm</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #444;">
    <p>Si le lien ne fonctionne pas : <a href="${ticketLink}" style="color: #666;">${ticketLink}</a></p>
  </div>
</body>
</html>
    `;

  const result = await sendMail(
    "lucas.stephan@epita.fr",
    "saint-valentin@bde-epita.fr",
    "Soirée Aphrodisiac",
    `🎁 ${senderName} t'offre une place pour la Soirée Aphrodisiac !`,
    textContent,
    htmlContent,
  );

  return ApiResponse.json(result);
};
