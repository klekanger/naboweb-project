export function validateEnvironmentVariables() {
  const requiredEnvVars = {
    EMAIL_SECRET_TOKEN: process.env.EMAIL_SECRET_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    AWS_SMTP_HOST: process.env.AWS_SMTP_HOST,
    AWS_SMTP_USER: process.env.AWS_SMTP_USER,
    AWS_SMTP_PASSWORD: process.env.AWS_SMTP_PASSWORD,
    AWS_SMTP_FROM_EMAIL: process.env.AWS_SMTP_FROM_EMAIL,
    SANITY_VIEWER_TOKEN: process.env.SANITY_VIEWER_TOKEN,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  return requiredEnvVars as Record<keyof typeof requiredEnvVars, string>;
}
