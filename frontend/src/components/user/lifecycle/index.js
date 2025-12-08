// Lifecycle Widget - Main export
export { default } from "./LifecycleWidget";
export { default as LifecycleWidget } from "./LifecycleWidget";

// Sub-components
export { default as LifecycleTimeline } from "./LifecycleTimeline";
export { default as LCTransientPath } from "./LCTransientPath";
export { default as LCConfirmModal } from "./LCConfirmModal";
export { default as LCPhaseDropdown } from "./LCPhaseDropdown";

// Helper functions and constants
export {
  PHASE_ID_ALIASES,
  normalizePhaseId,
  mapPhaseIdFromText,
  toDateOnlyString,
  flush,
  wait,
} from "./lifecycleHelpers";

