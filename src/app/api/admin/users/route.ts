import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { deleteSignetUser, getTrackingStatus, listRecentLogins, listSignetUsers } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const tracking = await getTrackingStatus();
  const [users, logins] = await Promise.all([listSignetUsers(), listRecentLogins(25)]);
  return NextResponse.json({
    tracking: tracking.status,
    trackingMessage: tracking.message,
    users,
    logins,
  });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id?.trim();
  if (!id) return NextResponse.json({ error: "Missing user id." }, { status: 400 });
  if (id === admin.user.id) {
    return NextResponse.json({ error: "Use Settings to delete your own account." }, { status: 400 });
  }

  await deleteSignetUser(id);
  return NextResponse.json({ ok: true });
}
