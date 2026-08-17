import { NextResponse } from "next/server";
import { bridgeFetch } from "@/lib/bridge-server";
import { bridgeErrorResponse, checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";
import type { UpdateRoleInput } from "@/lib/types";

type RouteContext = { params: Promise<{ tenantId: string; roleId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId, roleId } = await params;

  const input = (await request.json().catch(() => null)) as UpdateRoleInput | null;
  if (!input) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const data = await bridgeFetch<{ id: string }>(`/tenants/${tenantId}/roles/${roleId}`, {
      method: "PATCH",
      token: session.token,
      body: input,
    });
    return NextResponse.json(data);
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId, roleId } = await params;

  try {
    const data = await bridgeFetch<{ id: string }>(`/tenants/${tenantId}/roles/${roleId}`, {
      method: "DELETE",
      token: session.token,
    });
    return NextResponse.json(data);
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}
