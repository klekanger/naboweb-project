export type EmailAlertsAuthResult =
  | { authorized: true; isManualAuth: true }
  | { authorized: true; isManualAuth: false }
  | { authorized: false };

export function authorizeEmailAlertsRequest(
  request: Request,
  secrets: { emailSecretToken: string; cronSecret: string },
): EmailAlertsAuthResult {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false };
  }

  const token = authHeader.slice("Bearer ".length);

  if (token === secrets.cronSecret) {
    return { authorized: true, isManualAuth: false };
  }

  if (token === secrets.emailSecretToken) {
    return { authorized: true, isManualAuth: true };
  }

  return { authorized: false };
}
