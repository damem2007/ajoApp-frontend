/// <reference lib="webworker" />
/** Installable sandbox shell. There is deliberately no data-cache handler. */
const worker = self as unknown as ServiceWorkerGlobalScope;
worker.addEventListener("install", () => worker.skipWaiting());
worker.addEventListener("activate", (event) =>
  event.waitUntil(worker.clients.claim()),
);
export {};
