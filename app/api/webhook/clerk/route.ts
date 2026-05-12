import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  console.log("[clerk-webhook] ===== WEBHOOK RECEIVED (compat) =====");
  console.log("[clerk-webhook] URL:", req.url);
  console.log("[clerk-webhook] Headers:", {
    "content-type": req.headers.get("content-type"),
  });

  let evt;
  try {
    evt = await verifyWebhook(req);
    console.log("[clerk-webhook] ✅ Verification SUCCESSFUL (compat)");
  } catch (err) {
    console.error("[clerk-webhook] ❌ Verification FAILED (compat):", {
      error: err instanceof Error ? err.message : String(err),
      code: err instanceof Error ? (err as any).code : undefined,
    });
    // Only include non-sensitive debug flags in production; reveal lengths/prefixes in development
    if (process.env.NODE_ENV === "development") {
      console.error("[clerk-webhook] Debug info:", {
        secretKeyConfigured: !!process.env.CLERK_WEBHOOK_SIGNING_SECRET,
        secretKeyLength: process.env.CLERK_WEBHOOK_SIGNING_SECRET?.length,
        secretKeyPrefix: process.env.CLERK_WEBHOOK_SIGNING_SECRET?.substring(
          0,
          10,
        ),
      });
    } else {
      console.error(
        "[clerk-webhook] Debug info: secretKeyConfigured=",
        !!process.env.CLERK_WEBHOOK_SIGNING_SECRET,
      );
    }
    return new Response(
      JSON.stringify({ error: "Verification failed", details: String(err) }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const { type, data } = evt;
  console.log(`[clerk-webhook] Event type: ${type}`);
  console.log(`[clerk-webhook] Event data keys:`, Object.keys(data || {}));

  if (type === "user.created" || type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    const email = email_addresses[0]?.email_address ?? "";
    const name = [first_name, last_name].filter(Boolean).join(" ") || email;

    try {
      console.log(`[clerk-webhook] Attempting ${type} upsert:`, {
        id,
        email,
        name,
      });
      await prisma.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email, name, imageUrl: image_url ?? null },
        update: { email, name, imageUrl: image_url ?? null },
      });
      console.log(`[clerk-webhook] ✅ user ${type} synced successfully:`, {
        id,
        email,
        name,
      });
    } catch (err) {
      console.error(`[clerk-webhook] ❌ user ${type} sync FAILED:`, {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      return new Response(
        JSON.stringify({
          error: `User ${type} sync failed`,
          details: String(err),
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }
  }

  if (type === "user.deleted") {
    const { id } = data;
    if (id) {
      try {
        console.log(`[clerk-webhook] Attempting user delete:`, { id });
        await prisma.user.deleteMany({ where: { clerkId: id } });
        console.log(`[clerk-webhook] ✅ user deleted:`, { id });
      } catch (err) {
        console.error(`[clerk-webhook] ❌ user delete FAILED:`, {
          error: err instanceof Error ? err.message : String(err),
        });
        return new Response(
          JSON.stringify({ error: "User delete failed", details: String(err) }),
          {
            status: 500,
            headers: { "content-type": "application/json" },
          },
        );
      }
    }
  }

  if (
    type === "session.created" ||
    type === "session.ended" ||
    type === "session.removed" ||
    type === "session.revoked"
  ) {
    console.log(`[clerk-webhook] session event: ${type}`, {
      userId: data.user_id,
    });
  }

  if (
    type === "role.created" ||
    type === "role.updated" ||
    type === "role.deleted"
  ) {
    console.log(`[clerk-webhook] role event: ${type}`, { key: data.key });
  }

  if (
    type === "permission.created" ||
    type === "permission.updated" ||
    type === "permission.deleted"
  ) {
    console.log(`[clerk-webhook] permission event: ${type}`, { key: data.key });
  }

  if (type === "email.created") {
    console.log(`[clerk-webhook] email.created`, {
      toEmailAddress: data.to_email_address,
      subject: data.subject,
      deliveredBy: data.delivered_by_clerk,
    });
  }

  console.log("[clerk-webhook] ===== WEBHOOK COMPLETE (compat) =====");
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
