/** Public display preferences, explicitly supplied by the deployment. */
export function clientSettings() {
  const refresh = process.env.NEXT_PUBLIC_REFRESH_INTERVAL_SECONDS;
  const pageSize = process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE;
  const hostnameurl = process.env.FRONTEND_HOST;
  function positiveInteger(value: string | undefined, name: string): number {
    if (
      !value ||
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      Number(value) < 1
    ) {
      throw new Error(
        `Set ${name} to a positive integer in frontend/.env.local.`,
      );
    }
    return Number(value);
  }
  return {
    refreshIntervalMs:
      positiveInteger(refresh, "NEXT_PUBLIC_REFRESH_INTERVAL_SECONDS") * 1000,
    defaultPageSize: positiveInteger(pageSize, "NEXT_PUBLIC_DEFAULT_PAGE_SIZE"),
    apiBaseUrl: hostnameurl,
  };
}
