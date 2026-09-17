export interface Health {
  status: string;
  sandbox: boolean;
  live_payments: boolean;
  version: string;
}
export const runtimeApi = {
  health: async (): Promise<Health> => {
    const response = await fetch("/health", { cache: "no-store" });
    if (!response.ok) throw Error("Unable to read sandbox status");
    return response.json();
  },
};
