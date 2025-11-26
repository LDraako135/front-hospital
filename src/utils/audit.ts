// src/utils/audit.ts
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditKind = "computer" | "medical";

type AuditPayload = {
  id: string;
  kind: AuditKind;
  brand?: string;
  model?: string;
  userName?: string;
  userId?: string | null;
};

export async function logAudit(action: AuditAction, device: AuditPayload) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        kind: device.kind,
        deviceId: device.id,
        brand: device.brand,
        model: device.model,
        userName: device.userName,
        userId: device.userId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.warn("No se pudo registrar auditoría:", e);
  }
}
