import { NextResponse } from "next/server";
import { bridgeFetch } from "@/lib/bridge-server";
import { bridgeErrorResponse, checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";
import type { CreateOrganizationInput, TenantSummary } from "@/lib/types";

// GET is super_admin-only server-side; a tenant_admin gets a 403 here, which hooks/use-tenants.ts
// deliberately falls back on by reading `organizations` straight off InstantDB (scoped by instant.perms.ts).
export async function GET() {
  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;

  try {
    const data = await bridgeFetch<{ organizations: TenantSummary[] }>("/platform/organizations", {
      token: session.token,
    });
    return NextResponse.json(data);
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;

  const input = (await request.json().catch(() => null)) as CreateOrganizationInput | null;
  if (!input) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const data = await bridgeFetch<{ id: string; name: string; slug: string }>("/platform/organizations", {
      method: "POST",
      token: session.token,
      body: input,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}
