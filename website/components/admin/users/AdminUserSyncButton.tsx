"use client";

import { Button } from "@/components/ui/Button";
import { $fetch } from "@/lib/betterFetch";
import { toast } from "sonner";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function AdminUserSyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await $fetch("@post/api/admin/sync-roles", {});

      if (error) {
        toast.error(error.message || "Failed to sync roles");
        return;
      }

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
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
