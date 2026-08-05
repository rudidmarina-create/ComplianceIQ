"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, Loader2 } from "lucide-react";

interface TaskStatusActionsProps {
  taskId: string;
  currentStatus: string;
}

/**
 * Client component for updating a compliance task's status.
 * Shows Mark Complete / Mark In Progress buttons based on current status.
 */
export default function TaskStatusActions({
  taskId,
  currentStatus,
}: TaskStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to update status:", data.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {currentStatus !== "completed" && (
        <Button
          variant="primary"
          size="md"
          onClick={() => updateStatus("completed")}
          disabled={loading !== null}
        >
          {loading === "completed" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Mark Complete
        </Button>
      )}

      {currentStatus !== "in_progress" && currentStatus !== "completed" && (
        <Button
          variant="secondary"
          size="md"
          onClick={() => updateStatus("in_progress")}
          disabled={loading !== null}
        >
          {loading === "in_progress" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Mark In Progress
        </Button>
      )}

      {currentStatus === "completed" && (
        <Button
          variant="outline"
          size="md"
          onClick={() => updateStatus("pending")}
          disabled={loading !== null}
        >
          <RotateCcw className="h-4 w-4" />
          Reopen Task
        </Button>
      )}
    </div>
  );
}
