import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { maskRecipientPhone } from "@/lib/mock-notifications";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to access notifications." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const channel = searchParams.get("channel") || undefined;
    const status = searchParams.get("status") || undefined;

    // Homeowner role access control: can ONLY view notifications for their own project
    if (user.role === "HOMEOWNER") {
      if (!projectId) {
        return NextResponse.json(
          { error: "Homeowners must specify their own project ID." },
          { status: 403 }
        );
      }

      const lead = await SolarDB.getLeadById(projectId);
      if (!lead || lead.ownerUserId !== user.id) {
        return NextResponse.json(
          { error: "You do not have access to notifications for this project." },
          { status: 403 }
        );
      }

      const notifications = await SolarDB.getNotifications({
        projectId,
        channel,
        status,
      });

      // Mask recipient phone numbers for privacy
      const sanitized = notifications.map((n) => ({
        ...n,
        recipient: maskRecipientPhone(n.recipient),
      }));

      return NextResponse.json({ success: true, notifications: sanitized });
    }

    // Staff access (SALES, SURVEYOR, COORDINATOR)
    const notifications = await SolarDB.getNotifications({
      projectId,
      channel,
      status,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
