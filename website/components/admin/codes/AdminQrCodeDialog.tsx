import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import React from "react";
import QRCode from "react-qr-code";

type AdminQrCodeDialogProps = {
  name?: string;
  link?: string;
} & React.ComponentProps<typeof Dialog>;

const AdminQrCodeDialog = ({ name, link, ...rest }: AdminQrCodeDialogProps) => {
  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{name ?? "QrCode"}</DialogTitle>
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
