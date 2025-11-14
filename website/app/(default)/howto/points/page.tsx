import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const data = {
  "Vie du Campus": {
    "Affiches QR Code": 300,
    "Match beerpong (défaite)": 5,
    "Match beerpong (victoire)": 30,
    "Présence à un event": 30,
    "EpiTV ?": 40,
    "Concours de fanart (participation)": 50,
    "Concours de fanart (victoire)": 150,
  },
  Défis: {
    "Tampon main": 20,
    "Tampon crâne": 50,
    'Écrire "Votez Grimm" sur un tableau': 15,
    'Hurler "Votez Grimm" en vidéo': 50,
    "Venir déguisé dans le thème": 100,
    'Bio (Insta ou Discord) "Votez Grimm"': 20,
    "Photo de profil Grimm ou rond Grimm": 40,
    "Écrire sur le tyfo": 5,
    "Selfie avec Baptiste": 5,
    "Selfie avec Jules": 5,
    "Selfie avec Valentin": 5,
    "Selfie avec Simon": 5,
    "Selfie avec Nicolas": 5,
    "Selfie avec Arthur": 5,
  },
  Minecraft: {
    "Achievement Minecraft": "dépend de l’achievement",
    "Concours build top 3": 50,
    "Concours build top 2": 100,
    "Concours build victoire": 150,
  },
  Stickers: {
    "Photo Redbull": "sticker redbull",
    "O’Zaman": "sticker kebab",
    "Achat Lateb": "sticker vert",
    "Achat La Cave": "sticker vert",
    "Achat La Paillote": "sticker vert",
    Distribution: "sticker de base",
    "Collection complète de stickers": 100,
  },
};

const HowToPointsPage = () => {
  return (
    <div className="px-5 lg:px-8">
      <Accordion type="single" collapsible>
        {Object.keys(data).map((title) => (
          <AccordionItem key={title} value={title}>
            <AccordionTrigger className="text-2xl lg:text-4xl cursor-pointer">
              {title}
            </AccordionTrigger>
            {Object.entries(data[title as keyof typeof data]).map(([name, earning]) => (
              <AccordionContent key={name} className="flex gap-2 items-center">
                <p className="text-lg lg:text-2xl">{name}</p>
                <p className="rounded-full px-4 py-1 bg-secondary text-secondary-foreground text-sm lg:text-xl">
                  {earning}
                </p>
              </AccordionContent>
            ))}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default HowToPointsPage;
