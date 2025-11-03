"use client";

import React from "react";
import { $fetch } from "@/lib/betterFetch";
import { AdminCodesTable } from "@/components/admin/codes/AdminCodesTable";
import { AdminCodeCreateButton } from "@/components/admin/codes/AdminCodeCreateButton";
import { InferQueryModel } from "@/db";

type RedeemCodes = InferQueryModel<
  "redeemCodes",
  { users: { columns: { userId: true; createdAt: true } } }
>;

const CodesPage = () => {
  const [codes, setCodes] = React.useState<RedeemCodes[]>([]);

  React.useEffect(() => {
    $fetch("/api/admin/codes").then(({ data, error }) => {
      if (error) throw new Error(error.message);

      setCodes(data);
    });
  }, []);

  return (
    <div className="mx-8 flex flex-col gap-4">
      <AdminCodeCreateButton
        onNewCode={(code) => setCodes((old) => [...old, { ...code, users: [] }])}
      />
      <AdminCodesTable
        codes={codes}
        onRemoveCode={(code) => setCodes((old) => old.filter((c) => c.id !== code))}
        onUpdateCode={(code) =>
          setCodes((old) => [
            ...old.filter((c) => c.id !== code.id),
            { ...old.find((c) => c.id === code.id)!, ...code },
          ])
        }
      />
    </div>
  );
};

export default CodesPage;
