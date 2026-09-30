import { NextResponse } from "next/server";
import { certTypeLabel, type CertType } from "@/lib/cert/types";
import { requireAdmin } from "@/lib/admin";
import {
  countRowsSince,
  deleteSignetUser,
  getTrackingStatus,
  listCertificateEvents,
  listEventStamps,
  listPayments,
  listRecentLogins,
  listSignetUsers,
  periodStartIso,
} from "@/lib/users";

const CERT_TYPES = new Set<CertType>(["root-ca", "host", "self-signed", "client", "csr"]);

function utcDay(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
}

function seriesFrom(stamps: string[], days: number) {
  return Array.from({ length: days }, (_, index) => {
    const day = utcDay(index - (days - 1));
    const start = day.toISOString();
    const end = new Date(day.getTime() + 86_400_000).toISOString();
    return {
      date: start.slice(0, 10),
      count: stamps.filter((stamp) => stamp >= start && stamp < end).length,
    };
  });
}

function labelCertType(value?: string) {
  if (value && CERT_TYPES.has(value as CertType)) return certTypeLabel(value as CertType);
  return value || "Unknown";
}

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
  const now = Date.now();
  const dayAgo = new Date(now - 86_400_000).toISOString();
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString();
  const monthAgo = new Date(now - 30 * 86_400_000).toISOString();
  const [certsThisMonth, loginsThisMonth, paymentsThisMonth] = await Promise.all([
    countRowsSince("signet_certificate_events", monthStart),
    countRowsSince("signet_login_events", monthStart),
    countRowsSince("signet_payments", monthStart),
  ]);
  const signupsToday = users.filter((user) => user.created_at >= dayAgo).length;
  const signups7d = users.filter((user) => user.created_at >= weekAgo).length;
  const signups30d = users.filter((user) => user.created_at >= monthAgo).length;
  const free = users.filter((user) => user.plan === "free").length;
  const plus = users.filter((user) => user.plan === "plus").length;
  const studio = users.filter((user) => user.plan === "studio").length;
  const paid = plus + studio;
  const windowStart = utcDay(-29).toISOString();
  const [loginStamps, certStamps] = await Promise.all([
    listEventStamps("signet_login_events", windowStart),
    listEventStamps("signet_certificate_events", windowStart),
  ]);
  const typeCounts = new Map<string, number>();
  for (const stamp of certStamps) {
    const label = labelCertType(stamp.cert_type);
    typeCounts.set(label, (typeCounts.get(label) ?? 0) + 1);
  }
  const metrics = {
    users: users.length,
    free,
    plus,
    studio,
    active: users.filter((user) => (user.plan_status || "active") === "active").length,
    canceled: users.filter((user) => user.plan_status === "canceled" || user.plan_status === "expired").length,
    paid,
    paidPercent: users.length ? Math.round((paid / users.length) * 100) : 0,
    signupsToday,
    signups7d,
    signups30d,
    certsThisMonth,
    loginsThisMonth,
    paymentsThisMonth,
    transactions: payments.length,
    lifetimeCerts: users.reduce((sum, user) => sum + (user.certs_used || 0), 0),
    signupSeries: seriesFrom(users.map((user) => user.created_at), 30),
    loginSeries: seriesFrom(loginStamps.map((stamp) => stamp.created_at), 30),
    certSeries: seriesFrom(certStamps.map((stamp) => stamp.created_at), 30),
    certTypes: [...typeCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count),
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
