import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { RedeemCodes } from "@/db/schema/redeemCodes";
import React from "react";
import QRCode from "react-qr-code";

type AdminQrCodeDialogProps = {
  code?: RedeemCodes;
} & React.ComponentProps<typeof Dialog>;

const AdminQrCodeDialog = ({ code, ...rest }: AdminQrCodeDialogProps) => {
  const link = React.useMemo(
    () => (code ? `${window.location.origin}/redeem/${code.code}` : undefined),
    [code]
  );

  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{code?.name ?? "QrCode"}</DialogTitle>
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
