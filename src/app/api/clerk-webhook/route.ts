import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

type ClerkEvent =
  | { type: "user.created"; data: { id: string; email_addresses: { email_address: string }[] } }
  | { type: "user.updated"; data: { id: string; email_addresses: { email_address: string }[] } }
  | { type: "user.deleted"; data: { id: string } };

export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const headersObj = Object.fromEntries(req.headers);
  const body = await req.text();

  let evt: ClerkEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(body, headersObj) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency — use Svix message-id as the event key.
  const eventId = headersObj["svix-id"];
  if (typeof eventId !== "string") {
    return NextResponse.json({ error: "Missing svix-id" }, { status: 400 });
  }
  const seen = await db.processedEvent.findUnique({ where: { id: eventId } });
  if (seen) return NextResponse.json({ ok: true, duplicate: true });

  switch (evt.type) {
    case "user.created": {
      const email = evt.data.email_addresses[0]?.email_address;
      if (email) {
        await db.parent.upsert({
          where: { clerkUserId: evt.data.id },
          update: { email },
          // Bare-bones row — no Household yet (signup wizard creates that).
          // Use a sentinel householdId until full signup is completed.
          create: {
            clerkUserId: evt.data.id,
            email,
            role: "PARENT",
            household: {
              create: { ownerEmail: email, region: "NL" },
            },
          },
        });
      }
      break;
    }
    case "user.updated": {
      const email = evt.data.email_addresses[0]?.email_address;
      if (email) {
        await db.parent.updateMany({
          where: { clerkUserId: evt.data.id },
          data: { email },
        });
      }
      break;
    }
    case "user.deleted":
      // Soft-cascade — Cascade-delete via FK is fine; we don't break audit.
      await db.parent.deleteMany({ where: { clerkUserId: evt.data.id } });
      break;
  }

  await db.processedEvent.create({
    data: { id: eventId, source: "clerk" },
  });

  return NextResponse.json({ ok: true });
}
