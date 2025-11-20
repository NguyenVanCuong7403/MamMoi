// src/pages/tree/useGardenHeader.js
import { useEffect, useState } from "react";

export const LS_SELECTED_GARDEN = "mm_selected_garden_v1";

function readSelected() {
  try {
    const qs = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const id = qs.get("gardenId");
    const name = qs.get("gardenName");
    if (id || name) return { id: id || null, name: name || "" };

    const raw = localStorage.getItem(LS_SELECTED_GARDEN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useGardenHeader() {
  const [sel, setSel] = useState(() => readSelected());

  useEffect(() => {
    const onSelected = (e) => setSel(e.detail);
    const onRenamed = (e) =>
      setSel((s) => (s && s.id === e.detail.id ? { ...s, name: e.detail.name } : s));
    const onDeleted = (e) =>
      setSel((s) => (s && s.id === e.detail.id ? null : s));
    const onPop = () => setSel(readSelected()); // user back/forward

    window.addEventListener("mm:garden:selected", onSelected);
    window.addEventListener("mm:garden:renamed", onRenamed);
    window.addEventListener("mm:garden:deleted", onDeleted);
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("mm:garden:selected", onSelected);
      window.removeEventListener("mm:garden:renamed", onRenamed);
      window.removeEventListener("mm:garden:deleted", onDeleted);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // đồng bộ lại LS nếu mở thẳng /trees?gardenId=...
  useEffect(() => {
    if (sel?.id) {
      localStorage.setItem(LS_SELECTED_GARDEN, JSON.stringify(sel));
    } 
  }, [sel?.id, sel?.name]);

  return { gardenId: sel?.id || null, gardenName: sel?.name || "" };
}
