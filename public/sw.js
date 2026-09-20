// Generated from src/workers/service-worker.ts; edit that source.
/// <reference lib="webworker" />
/** Installable sandbox shell. There is deliberately no data-cache handler. */
const worker = self;
worker.addEventListener("install", () => worker.skipWaiting());
worker.addEventListener("activate", (event) => event.waitUntil(worker.clients.claim()));
export {};
