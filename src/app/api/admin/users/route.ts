import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  deleteSignetUser,
  getTrackingStatus,
  listCertificateEvents,
  listPayments,
  listRecentLogins,
  listSignetUsers,
  periodStartIso,
} from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const tracking = await getTrackingStatus();
  const [users, logins, payments, certificates] = await Promise.all([
    listSignetUsers(),
    listRecentLogins(40),
    listPayments(100),
    listCertificateEvents(80),
  ]);

  const monthStart = periodStartIso();
  const certsThisMonth = certificates.filter((item) => item.created_at >= monthStart).length;
  const loginsThisMonth = logins.filter((item) => item.created_at >= monthStart).length;
  const metrics = {
    users: users.length,
    free: users.filter((user) => user.plan === "free").length,
    plus: users.filter((user) => user.plan === "plus").length,
    studio: users.filter((user) => user.plan === "studio").length,
    active: users.filter((user) => (user.plan_status || "active") === "active").length,
    canceled: users.filter((user) => user.plan_status === "canceled" || user.plan_status === "expired").length,
    paid: users.filter((user) => user.plan === "plus" || user.plan === "studio").length,
    certsThisMonth,
    loginsThisMonth,
    transactions: payments.length,
    lifetimeCerts: users.reduce((sum, user) => sum + (user.certs_used || 0), 0),
  };

  return NextResponse.json({
    tracking: tracking.status,
    trackingMessage: tracking.message,
    users,
    logins,
    payments,
    certificates,
    metrics,
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
