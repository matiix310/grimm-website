"use client";

import { Button } from "@/components/ui/Button";
import { syncRoles } from "@/app/actions/sync-roles";
import { toast } from "sonner";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function AdminUserSyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncRoles();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={isLoading} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      Sync Roles
    </Button>
  );
}
