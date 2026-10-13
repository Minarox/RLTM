import { timingSafeEqual } from "node:crypto";

// Hook of the authentication of the administration API (to replace with the accounts of the organizers).
// Until then, the API needs the token of the RLTM_ADMIN_TOKEN environment variable, and is disabled without it.
export function authorizeAdmin({ headers, set }: { headers: Record<string, string | undefined>, set: { status?: number | string } }): string | void {
    const adminToken = process.env['RLTM_ADMIN_TOKEN'];
    if (!adminToken) {
        set.status = 403;
        return "ADMIN_API_DISABLED";
    }

    const authorization = headers['authorization'] ?? "";
    const token = Buffer.from(authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "");
    const expected = Buffer.from(adminToken);
    if (token.length !== expected.length || !timingSafeEqual(token, expected)) {
        set.status = 401;
        return "UNAUTHORIZED";
    }
}
