import { NextResponse } from "next/server";
import { bridgeFetch } from "@/lib/bridge-server";
import { bridgeErrorResponse, checkPanelRequestHeader, requireSessionOrRespond } from "@/lib/api-helpers";
import type { BrandingRow, TenantConfigInput, ThemeRow } from "@/lib/types";

type RouteContext = { params: Promise<{ tenantId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  try {
    const data = await bridgeFetch<{ theme: ThemeRow | null; branding: BrandingRow | null }>(
      `/tenants/${tenantId}/config`,
      { token: session.token },
    );
    return NextResponse.json(data);
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const guard = checkPanelRequestHeader(request);
  if (guard) return guard;

  const { session, response } = await requireSessionOrRespond();
  if (!session) return response;
  const { tenantId } = await params;

  const input = (await request.json().catch(() => null)) as TenantConfigInput | null;
  if (!input) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const data = await bridgeFetch<{ ok: true }>(`/tenants/${tenantId}/config`, {
      method: "PUT",
      token: session.token,
      body: input,
    });
    return NextResponse.json(data);
  } catch (err) {
    return bridgeErrorResponse(err);
  }
}
