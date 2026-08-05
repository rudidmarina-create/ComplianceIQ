import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/tasks/[id]/status
 * Update a compliance task's status. Only the task owner can update.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !["pending", "in_progress", "completed", "not_applicable"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the task belongs to the user's company
    const task = await prisma.complianceTask.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: { ownerId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.company.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the task status
    const updated = await prisma.complianceTask.update({
      where: { id: params.id },
      data: {
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
