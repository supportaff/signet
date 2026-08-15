import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { deleteSignetUser, upsertSignetUser } from "@/lib/users";

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET is not set." }, { status: 500 });
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers." }, { status: 400 });
  }

  let event: {
    type: string;
    data: {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email_addresses?: { email_address: string }[];
    };
  };

  try {
    event = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid Clerk signature." }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const email = event.data.email_addresses?.[0]?.email_address ?? null;
    const name = [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || null;
    await upsertSignetUser({ clerkId: event.data.id, email, name });
  }

  if (event.type === "user.deleted") {
    await deleteSignetUser(event.data.id);
  }

  return NextResponse.json({ ok: true });
}
