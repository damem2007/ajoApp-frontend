/** Next.js development-server hosts, separate from API CORS origins. */
export function allowedDevOrigins(): string[] {
  const value = process.env.AJO_ALLOWED_DEV_ORIGINS;
  if (!value?.trim())
    throw new Error(
      "Set AJO_ALLOWED_DEV_ORIGINS in frontend/.env.local to comma-separated hostnames.",
    );
  const hosts = [
    ...new Set(
      value
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean),
    ),
  ];
  if (
    !hosts.length ||
    hosts.some(
      (host) =>
        !/^(\*\.)?[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(host),
    )
  ) {
    throw new Error(
      "AJO_ALLOWED_DEV_ORIGINS must contain hostnames or IP addresses without schemes, ports or paths.",
    );
  }
  return hosts;
}
