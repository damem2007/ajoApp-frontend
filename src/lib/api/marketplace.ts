import { request } from "./client";
import { runtimeApi } from "./runtime";
import examples from "../examples.json";
export type { CatalogueCircle as Circle } from "../types";
import type { CatalogueCircle as Circle } from "../types";
export async function catalogue(): Promise<Circle[]> {
  const circles = await request<Circle[]>("/public/marketplace");
  if (circles.length) return circles;
  return (await runtimeApi.health()).sandbox ? examples : circles;
}
