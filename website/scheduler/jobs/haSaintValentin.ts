import { sendDiscordNotification } from "@/lib/discord";
import { ScheduledJob } from "../";
import { sendMail } from "@/lib/sendMail";
import { db } from "@/db";
import { promoCodes } from "@/db/schema/promoCodes";
import { eq } from "drizzle-orm";
import helloasso from "@/lib/helloasso";

const job = {
  name: "haSaintValentin",
  expression: "*/5 * * * *",
  environment: ["production"],
  options: {
    timezone: "Europe/Paris",
  },
  func: async () => {
    const { data, error } = await helloasso.request(
      "/organizations/bde-epita/forms/Event/:eventSlug/items",
      {
        params: {
          eventSlug: "aphrodisiac-under-14-02",
        },
        query: {
          itemStates: ["Processed"],
          pageSize: 100,
          pageIndex: 1,
          sortField: "UpdateDate",
          sortOrder: "Desc",
          withDetails: true,
        },
      },
    );

    if (error || !data.data) {
      console.error("Failed to get a list of participants:", error);
      await sendDiscordNotification(
        "Failed to get a list of participants",
        "See console for more details",
        "error",
      );
      return;
    }

    // What is offered by whom
    const tickets = {
      "EARLY DUO": "EARLY DUO",
      "REGULAR DUO": "REGULAR DUO",
      "LATE DUO": "LATE DUO",
    } as const;

    const codes = await db.query.promoCodes.findMany();

    // get the participants with a DUO ticket
    const newDuoTickets = data.data.filter(
      (p) =>
        p.name in tickets &&
        codes.find((c) => c.orderId === p.id) === undefined &&
        p.payments !== undefined &&
        p.payments.length > 0 &&
        p.discount === undefined,
    );

    if (newDuoTickets.length === 0) return;

    console.log("New orders to process:", newDuoTickets.map((p) => p.id).join(", "));
    sendDiscordNotification(
      "New orders to process",
      newDuoTickets.map((p) => p.id).join(", "),
      "info",
    );

    const usedCodes: Map<
      string,
      {
        orderId: number;
        targetEmail: string;
        sender: string;
        ticketKind: (typeof tickets)[keyof typeof tickets];
      }
    > = new Map();

    for (const ticket of newDuoTickets) {
      const code = codes.find(
        (c) =>
          !c.used &&
          !usedCodes.has(c.code) &&
          c.kind === tickets[ticket.name as keyof typeof tickets],
      );

      if (!code) {
        console.error("No code available for ticket:", ticket.id);
        await sendDiscordNotification(
          `No code available`,
          `Order ID : ${ticket.id}\nTicket kind : ${tickets[ticket.name as keyof typeof tickets]}`,
          "error",
        );
        continue;
      }

      const targetEmail =
        ticket.customFields
          ?.find((f: { name: string }) => f.name.includes("Email du Duo"))
          ?.answer.trim() ?? ticket.payer.email.trim();

      usedCodes.set(code.code, {
        orderId: ticket.id,
        targetEmail,
        sender: (ticket.user.firstName + " " + ticket.user.lastName).replace(
          /[^a-zA-Z -]/g,
          "",
        ),
        ticketKind: tickets[ticket.name as keyof typeof tickets],
      });
    }

    for (const [code, data] of usedCodes.entries()) {
      const ticketLink =
        "https://www.helloasso.com/associations/bde-epita/evenements/aphrodisiac-under-14-02";

      const textContent = `
        Salut !
        
        ${data.sender} t'offre une place ${data.ticketKind} pour la Soirée Aphrodisiac organisée par le BDE Grimm !
        
        Voici ton code promo exclusif pour obtenir ta place ${data.ticketKind} offerte : ${code}
        
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
                 <strong>${data.sender}</strong> t'offre une place <strong>${data.ticketKind}</strong> pour la soirée la plus attendue de l'année. Prépare-toi à une ambiance électrique !
               </p>
               
               <!-- Promo Code Box -->
               <div style="background-color: #252525; border: 2px dashed #ff4081; padding: 20px; margin: 30px 0; text-align: center; border-radius: 8px;">
                 <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Ton Code Promo</p>
                 <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #ffffff; display: block;">${code}</span>
               </div>
        
               <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center; margin-bottom: 30px;">
                 Pour utiliser ce code, séléctionne un ticket <strong>${data.ticketKind}</strong>, puis, à la dernière étape, entre le code promo pour bénéficier de ta place offerte.
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
        data.targetEmail,
        "saint-valentin@bde-epita.fr",
        "Soirée Aphrodisiac",
        `🎁 ${data.sender} t'offre une place pour la Soirée Aphrodisiac !`,
        textContent,
        htmlContent,
      );

      if (result.error) {
        console.error("Failed to send email for order ", data.orderId);
        console.error(result.result);
        await sendDiscordNotification(
          "Failed to send email",
          `Order ID : ${data.orderId}\nTicket kind : ${data.ticketKind}\nTarget email : ${data.targetEmail}`,
          "error",
        );
      } else {
        await sendDiscordNotification(
          "Email sent",
          `Order ID : ${data.orderId}\nTicket kind : ${data.ticketKind}\nTarget email : ${data.targetEmail}`,
          "success",
        );
        // set codes to used
        await db
          .update(promoCodes)
          .set({
            used: true,
            orderId: data.orderId,
          })
          .where(eq(promoCodes.code, code));
      }
    }
  },
} as const satisfies ScheduledJob;

export default job;
