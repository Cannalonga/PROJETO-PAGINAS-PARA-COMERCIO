// app/api/deploy/rollback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantFromSession } from "@/lib/tenant-session";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

/**
 * POST /api/deploy/rollback
 * Faz rollback de uma página para versão anterior
 * 
 * @body { pageId: string, targetVersion?: string }
 * @returns { success: boolean, version?: string, deployedUrl?: string, error?: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId, targetVersion } = await req.json();
  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const tenantId = await getTenantFromSession(session);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  try {
    // Buscar última versão bem-sucedida
    const lastSuccessfulDeployment = await prisma.deployment.findFirst({
      where: {
        tenantId,
        pageId,
        status: "SUCCESS",
      },
      orderBy: { finishedAt: "desc" },
    });

    if (!lastSuccessfulDeployment || !lastSuccessfulDeployment.deployedUrl) {
      return NextResponse.json(
        { error: "No previous deployment found" },
        { status: 404 }
      );
    }

    // Registrar rollback
    const rollbackDeployment = await prisma.deployment.create({
      data: {
        tenantId,
        pageId,
        version: `rollback-${Date.now()}`,
        status: "ROLLED_BACK",
        provider: lastSuccessfulDeployment.provider,
        deployedUrl: lastSuccessfulDeployment.deployedUrl,
        previewUrl: lastSuccessfulDeployment.previewUrl,
        startedAt: new Date(),
        finishedAt: new Date(),
        metadata: {
          rollbackFrom: lastSuccessfulDeployment.version,
        },
      },
    });

    // Log de auditoria
    await logAuditEvent({
      tenantId,
      action: "deployment_rolled_back",
      entity: "deployment",
      entityId: rollbackDeployment.id,
      metadata: {
        pageId,
        version: lastSuccessfulDeployment.version,
        deployedUrl: lastSuccessfulDeployment.deployedUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        version: lastSuccessfulDeployment.version,
        deployedUrl: lastSuccessfulDeployment.deployedUrl,
        message: "Rollback successful",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/deploy/rollback]", err);

    // Log de erro
    await logAuditEvent({
      tenantId,
      action: "deployment_rollback_failed",
      entity: "deployment",
      entityId: pageId,
      metadata: { error: err?.message ?? "Unknown error" },
    });

    return NextResponse.json(
      { error: err?.message ?? "Rollback failed" },
      { status: 500 }
    );
  }
}
