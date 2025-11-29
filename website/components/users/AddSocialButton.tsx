"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { authClient } from "@/lib/authClient";

type AddSocialButtonProps = {
  state: {
    minecraft?: boolean;
    discord?: boolean;
  };
} & React.ComponentProps<typeof Button>;

const AddSocialButton = ({
  state: { minecraft: minecraftState = true, discord: discordState = true },
  children,
  ...rest
}: AddSocialButtonProps) => {
  return (
    <Dialog {...rest}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="default" className="mt-4">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lier un compte</DialogTitle>
          <DialogDescription>
            Selectionne un compte à lier à ton compte Grimm.
          </DialogDescription>
        </DialogHeader>
        <Button variant="secondary" size="lg" disabled={minecraftState || true}>
          Minecraft (play.bde-grimm.com)
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={discordState}
          onClick={() =>
            authClient.linkSocial({
              provider: "discord",
              callbackURL: window.location.href,
            })
          }
        >
          Discord
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export { AddSocialButton };
