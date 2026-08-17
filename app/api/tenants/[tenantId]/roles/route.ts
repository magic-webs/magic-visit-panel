import { NextResponse } from "next/server";
import { bridgeFetch } from "@/lib/bridge-server";
import { bridgeErrorResponse, checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";
import type { CreateRoleInput, RoleRow } from "@/lib/types";

type RouteContext = { params: Promise<{ tenantId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  try {
    const data = await bridgeFetch<{ roles: RoleRow[] }>(`/tenants/${tenantId}/roles`, { token: session.token });
    return NextResponse.json(data);
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  const input = (await request.json().catch(() => null)) as CreateRoleInput | null;
  if (!input) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const data = await bridgeFetch<{ id: string }>(`/tenants/${tenantId}/roles`, {
      method: "POST",
      token: session.token,
      body: input,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}
