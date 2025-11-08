import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Answers } from "@/db/schema/answers";
import React from "react";
import QRCode from "react-qr-code";

type AdminQrCodeDialogProps = {
  answer?: Answers;
} & React.ComponentProps<typeof Dialog>;

const AdminQrCodeDialog = ({ answer, ...rest }: AdminQrCodeDialogProps) => {
  const link = React.useMemo(
    () => (answer ? `${window.location.origin}/answers/${answer.id}` : undefined),
    [answer]
  );

  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{answer?.name ?? "QrCode"}</DialogTitle>
          <DialogDescription>Lien original: {link ?? "Chargements..."}</DialogDescription>
        </DialogHeader>
        {link && (
          <QRCode
            size={256}
            style={{ height: "auto", width: "100%" }}
            value={link}
            viewBox={`0 0 256 256`}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export { AdminQrCodeDialog };
