"use client";
import Home from "./Home";
import { cmsApi } from "@/lib/api/cms";
import { Loading, useResource } from "@/components/ui/Data";
export default function CmsPreview() {
  const { value, error } = useResource(cmsApi.preview);
  return value ? <Home content={value.content} /> : <Loading error={error} />;
}
