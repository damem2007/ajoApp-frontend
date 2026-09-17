import { request } from "./client";
import { runtimeApi } from "./runtime";
import examples from "../examples.json";
export type Circle = {
  id: string;
  name: string;
  description?: string;
  category: string;
  currency: string;
  target_minor: number;
  frequency: string;
  members: number;
  slots: number;
  trust_threshold: number;
  featured?: boolean;
  illustrative?: boolean;
  trust_label?: string;
  next_days?: number;
};
export async function catalogue(): Promise<Circle[]> {
  const circles = await request<Circle[]>("/public/marketplace");
  if (circles.length) return circles;
  return (await runtimeApi.health()).sandbox ? examples : circles;
}
