import { getEnvOrThrow } from "./env";

export const sendDiscordNotification = async (
  title: string,
  message: string,
  status: "success" | "error" | "info" = "info",
) => {
  const discordWebhook = getEnvOrThrow("DISCORD_ROLE_SYNC_WEBHOOK_URL");
  if (discordWebhook) {
    let color = 0x00ff00;
    if (status === "error") color = 0xff0000;
    if (status === "info") color = 0x0000ff;
    try {
      const embed = {
        title: title,
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
          text: "GRIMM Website",
        },
      };

      await fetch(discordWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });
    } catch (err) {
      console.error("Failed to send Discord notification:", err);
    }
  }
};
