"use client";

import { authClient } from "@/lib/authClient";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const GoogleStaffRegister = () => {
  React.useEffect(() => {
    authClient
      .linkSocial({
        provider: "google",
      })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Google staff linked successfully");
        redirect("/");
      });
  }, []);

  return <p>Redirecting to google staff login...</p>;
};

export { GoogleStaffRegister };
