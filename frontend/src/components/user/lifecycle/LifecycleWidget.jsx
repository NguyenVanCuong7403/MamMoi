import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import TreeRepository from "@/API/repositories/TreeRepository";
import {
  getOrderedPhases,
  PHASE_IDS,
  normalizeLifecycleTheme,
} from "@/lib/lifecycleTheme";

// Import local components and helpers
import {
  normalizePhaseId,
  mapPhaseIdFromText,
  flush,
  wait,
} from "./lifecycleHelpers";
import LifecycleTimeline from "./LifecycleTimeline";
import LCConfirmModal from "./LCConfirmModal";
import LCPhaseDropdown from "./LCPhaseDropdown";

// Re-export helper functions for use in TreeDetail.jsx
export { normalizePhaseId, mapPhaseIdFromText };

// =========================================================================
// LifecycleWidget Component (Main Component)
// =========================================================================
export default function LifecycleWidget({
  tree,
  meta,
  portalId,
  value,
  onChange,
  cycleCount: cycleCountProp,
  phase1Completed: phase1CompletedProp,
  disabled = false,
  treeId,
  treeType,
  treeVariety,
  onPhaseGateChange,
  autoLifecycleEnabled,
  autoLifecycleDisabledAt,
  phaseTheme,
  phaseThemeAllowPartial = false,
  enableNodeEditing = false,
  onPhaseNodeClick,
  onPhaseNodeReorder,
}) {
  // Lấy giá trị đầu tiên có thật (string hoặc object {name/label/...})
  const first = (...xs) => xs.find(Boolean) || "";

  // Chuẩn hoá cách đọc "loại" và "giống" từ nhiều kiểu data phổ biến
  const getLoai = (src) =>
    labelOf(
      first(
        src?.loai,
        src?.type,
        src?.species,
        src?.plant,
        src?.tree_type,
        src?.cropName,
        src?.nameLoai
      )
    );

  const getGiong = (src) =>
    labelOf(
      first(
        src?.giong,
        src?.variety,
        src?.cultivar,
        src?.subtype,
        src?.tree_variety,
        src?.nameGiong
      )
    );

  // Use a ref to always have access to the latest treeId (fixes stale closure issue)
  const treeIdRef = useRef(treeId);
  useEffect(() => {
    treeIdRef.current = treeId;
    console.log(
      "[LifecycleWidget] treeId prop updated:",
      treeId,
      "treeIdRef.current:",
      treeIdRef.current
    );
  }, [treeId]);

  // Debug: log on every render
  //console.log("[LifecycleWidget] render - treeId prop:", treeId);

  const themeSource =
    phaseTheme ?? meta?.seasonalRoadmap ?? tree?.seasonalRoadmap;
  const normalizedTheme = useMemo(
    () => normalizeLifecycleTheme(themeSource),
    [phaseTheme, meta?.seasonalRoadmap, tree?.seasonalRoadmap]
  );

  const allowPartialPhases =
    phaseThemeAllowPartial ||
    (Array.isArray(themeSource) && themeSource.length);

  const mergedThemeMap = useMemo(() => {
    const buildEntry = (phaseId, override = {}, index = 0) => {
      // Removed implicit defaults — only use explicit override values.
      const base = {};
      const colorKey = override.colorKey
        ? String(override.colorKey).toLowerCase()
        : null;
      const lineColorKey = override.lineColorKey
        ? String(override.lineColorKey).toLowerCase()
        : override.colorKey
          ? String(override.colorKey).toLowerCase()
          : null;
      const canonicalPhaseId = override.canonicalPhaseId || phaseId;
      const stageId = override.stageId ?? override.rawStage?.stageId ?? null;
      const stageOrder =
        typeof override.stageOrder === "number" ? override.stageOrder : index;
      return {
        phaseId,
        canonicalPhaseId,
        label: override.label || phaseId,
        subtitle: override.subtitle || "",
        description: override.description || "",
        icon: override.icon || null,
        colorKey,
        lineColorKey,
        lineStyle: override.lineStyle || null,
        durationMs: override.durationMs != null ? override.durationMs : null,
        order: typeof override.order === "number" ? override.order : index,
        stageId,
        stageOrder,
      };
    };

    const normalizedKeys = Object.keys(normalizedTheme || {});
    if (allowPartialPhases && normalizedKeys.length > 0) {
      return normalizedKeys.reduce((acc, key, index) => {
        acc[key] = buildEntry(key, normalizedTheme[key], index);
        return acc;
      }, {});
    }

    return PHASE_IDS.reduce((acc, phaseId, index) => {
      acc[phaseId] = buildEntry(phaseId, normalizedTheme[phaseId], index);
      return acc;
    }, {});
  }, [normalizedTheme, allowPartialPhases]);

  const orderedPhaseConfigs = useMemo(
    () =>
      getOrderedPhases(mergedThemeMap, {
        allowPartial: allowPartialPhases,
      }),
    [mergedThemeMap, allowPartialPhases]
  );

  const defaultCycleConfigs = useMemo(() => [], []);

  const phase1Config = useMemo(() => {
    if (allowPartialPhases && orderedPhaseConfigs.length > 0) {
      return orderedPhaseConfigs[0];
    }
    const found = orderedPhaseConfigs.find(
      (phase) => phase.phaseId === "growth_development"
    );
    if (found) return found;
    // Do not fallback to a hardcoded default phase config; return null
    return null;
  }, [allowPartialPhases, orderedPhaseConfigs]);

  const cyclePhaseConfigs = useMemo(() => {
    // Khi allowPartialPhases = true, chỉ sử dụng các phase từ config (không fallback)
    if (allowPartialPhases) {
      if (orderedPhaseConfigs.length > 0) {
        return orderedPhaseConfigs.slice(1);
      }
      return []; // Không có cycle phases nếu chỉ có 1 giai đoạn
    }
    // Chế độ mặc định: filter và fallback nếu cần
    const filtered = orderedPhaseConfigs.filter(
      (phase) => phase.phaseId !== "growth_development"
    );
    // Do not fallback to defaultCycleConfigs when no theme is provided;
    // return filtered (may be empty) so default 4 phases are not loaded.
    return filtered;
  }, [allowPartialPhases, orderedPhaseConfigs, defaultCycleConfigs]);

  const phaseList = useMemo(() => {
    const list = [];
    if (phase1Config) list.push(phase1Config);
    if (Array.isArray(cyclePhaseConfigs) && cyclePhaseConfigs.length) {
      list.push(...cyclePhaseConfigs);
    }
    return list;
  }, [phase1Config, cyclePhaseConfigs]);

  const findPhaseById = useCallback(
    (phaseId) =>
      phaseList.find(
        (phase) =>
          phase.phaseId === phaseId ||
          phase.id === phaseId ||
          phase.phaseId === normalizePhaseId(phaseId)
      ) || null,
    [phaseList]
  );

  const findPhaseByStageId = useCallback(
    (stageId) =>
      stageId == null
        ? null
        : phaseList.find((phase) => phase.stageId === stageId) || null,
    [phaseList]
  );

  const findPhaseByCanonical = useCallback(
    (canonicalId) =>
      !canonicalId
        ? null
        : phaseList.find(
          (phase) =>
            phase.canonicalPhaseId === canonicalId ||
            phase.phaseId === canonicalId
        ) || null,
    [phaseList]
  );

  const labelOf = useCallback(
    (id) => {
      if (!id) return "";
      const match =
        findPhaseById(id) || findPhaseByCanonical(normalizePhaseId(id));
      return match?.label || match?.name || id;
    },
    [findPhaseByCanonical, findPhaseById]
  );

  const cyclePhaseIds = useMemo(
    () => cyclePhaseConfigs.map((phase) => phase.phaseId),
    [cyclePhaseConfigs]
  );

  const phaseConfigs = useMemo(
    () => ({
      phase1: phase1Config,
      cycles: cyclePhaseConfigs,
    }),
    [phase1Config, cyclePhaseConfigs]
  );

  const isCyclePhase = (p) => cyclePhaseIds.includes(p);

  const displayType = treeType || getLoai(meta) || getLoai(tree);

  const displayVariety = treeVariety || getGiong(meta) || getGiong(tree);

  // Ưu tiên phase từ props.value (DB) -> fallback text trong tree
  let initPhase = normalizePhaseId(
    value ??
    tree?.lifecycle?.currentPhaseId ??
    mapPhaseIdFromText(
      tree?.phenology?.currentPhase ||
      tree?.phenology?.stage ||
      tree?.phase ||
      ""
    )
  );
  // Do not apply an implicit default when missing; keep `initPhase` null/undefined
  // so caller code can explicitly handle absence of phase.

  // Tính trạng thái ban đầu từ prop / tree
  const initialPhase1Completed =
    typeof phase1CompletedProp === "boolean"
      ? phase1CompletedProp
      : initPhase
        ? initPhase !== "growth_development"
        : false;

  // Nếu đã qua giai đoạn 1 thì trailIndex = index của phase hiện tại
  const initialTrailIndex = initialPhase1Completed
    ? Math.max(0, cyclePhaseIds.indexOf(initPhase))
    : -1;

  // Nếu không có stage từ DB/props thì hiển thị "Unknow"
  const externalStageId =
    tree?.stageId ?? tree?.lifecycle?.stageId ?? meta?.stageId ?? null;

  // Phase controlled
  const [activePhase, setActivePhase] = useState(initPhase);
  const [activeStageId, setActiveStageId] = useState(externalStageId);

  // Sync activePhase khi value prop thay đổi (từ parent/API)
  useEffect(() => {
    if (value == null) return;

    const normalizedValue = normalizePhaseId(value);

    // Kiểm tra phase1 trước
    if (
      phase1Config &&
      (phase1Config.phaseId === normalizedValue ||
        phase1Config.canonicalPhaseId === normalizedValue ||
        normalizePhaseId(phase1Config.phaseId) === normalizedValue)
    ) {
      const targetPhaseId = phase1Config.phaseId;
      setActivePhase((prev) => (prev !== targetPhaseId ? targetPhaseId : prev));
      return;
    }

    // Tìm phase config matching với value trong cycle phases
    const matchedPhase = cyclePhaseConfigs.find(
      (phase) =>
        phase.phaseId === normalizedValue ||
        phase.canonicalPhaseId === normalizedValue ||
        normalizePhaseId(phase.phaseId) === normalizedValue
    );

    // Nếu tìm thấy, dùng phaseId từ config; nếu không, dùng normalized value
    const targetPhaseId = matchedPhase?.phaseId || normalizedValue;

    setActivePhase((prev) => (prev !== targetPhaseId ? targetPhaseId : prev));
  }, [value, phase1Config, cyclePhaseConfigs]);

  useEffect(() => {
    if (externalStageId != null && externalStageId !== activeStageId) {
      setActiveStageId(externalStageId);
    }
  }, [externalStageId]);

  useEffect(() => {
    if (!phaseList.length) return;
    if (activeStageId != null) {
      const stageMatch = findPhaseByStageId(activeStageId);
      if (stageMatch && stageMatch.phaseId !== activePhase) {
        setActivePhase(stageMatch.phaseId);
        return;
      }
    }
    const canonicalMatch = findPhaseByCanonical(initPhase);
    if (canonicalMatch && canonicalMatch.phaseId !== activePhase) {
      setActivePhase(canonicalMatch.phaseId);
    }
  }, [
    phaseList,
    activeStageId,
    findPhaseByStageId,
    findPhaseByCanonical,
    initPhase,
  ]);

  // Phase1Completed & cycleCount controlled
  const [isPhase1Completed, setIsPhase1Completed] = useState(
    initialPhase1Completed
  );
  useEffect(() => {
    if (typeof phase1CompletedProp === "boolean") {
      setIsPhase1Completed(phase1CompletedProp);
    }
  }, [phase1CompletedProp]);

  const [cycleCount, setCycleCount] = useState(
    Number.isFinite(cycleCountProp) ? Number(cycleCountProp) : 0
  );
  useEffect(() => {
    if (Number.isFinite(cycleCountProp)) {
      setCycleCount(Number(cycleCountProp));
    }
  }, [cycleCountProp]);

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(
    typeof autoLifecycleEnabled === "boolean" ? autoLifecycleEnabled : true
  );
  useEffect(() => {
    if (typeof autoLifecycleEnabled === "boolean") {
      setAutoSyncEnabled(autoLifecycleEnabled);
    }
  }, [autoLifecycleEnabled]);

  const [autoDisabledAt, setAutoDisabledAt] = useState(
    autoLifecycleDisabledAt || null
  );
  useEffect(() => {
    setAutoDisabledAt(autoLifecycleDisabledAt || null);
  }, [autoLifecycleDisabledAt]);

  const [togglingAuto, setTogglingAuto] = useState(false);

  const autoStatusText = useMemo(() => {
    if (autoSyncEnabled) {
      return "Đang tự động chuyển giai đoạn theo tuổi và loại cây.";
    }
    if (!autoDisabledAt) {
      return "Đang ghi đè thủ công (tạm dừng tự động).";
    }
    const dt = new Date(autoDisabledAt);
    if (Number.isNaN(dt.getTime())) {
      return "Đang ghi đè thủ công (tạm dừng tự động).";
    }
    return `Đang ghi đè thủ công từ ${dt.toLocaleString("vi-VN")}.`;
  }, [autoSyncEnabled, autoDisabledAt]);

  const toggleButtonDisabled = disabled || togglingAuto || !treeId;

  // UI state
  const [previewPhase, setPreviewPhase] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [transitionFlow, setTransitionFlow] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [p1Transition, setP1Transition] = useState(false);
  const [p1Key, setP1Key] = useState(0);
  const [p1Mode, setP1Mode] = useState("grow");
  const [trailIndex, setTrailIndex] = useState(isPhase1Completed ? 0 : -1);
  const [suppressId, setSuppressId] = useState(null);
  const [isBackwardRun, setIsBackwardRun] = useState(false);
  const [postHideIdx, setPostHideIdx] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSpinReset = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  };

  useEffect(() => {
    // Nếu parent đẩy phase/phase1Completed mới từ DB thì đồng bộ lại
    const externalPhase = normalizePhaseId(
      value ??
      tree?.lifecycle?.currentPhaseId ??
      mapPhaseIdFromText(
        tree?.phenology?.currentPhase ||
        tree?.phenology?.stage ||
        tree?.phase ||
        ""
      )
    );

    const externalP1Done =
      typeof phase1CompletedProp === "boolean"
        ? phase1CompletedProp
        : externalPhase !== "growth_development";

    // Cập nhật isPhase1Completed nếu thay đổi
    setIsPhase1Completed((prev) =>
      prev !== externalP1Done ? externalP1Done : prev
    );

    if (!externalP1Done) {
      setTrailIndex(-1);
      return;
    }

    // Tìm index bằng cách match canonical phase ID thay vì phaseId trực tiếp
    let idx = cyclePhaseIds.indexOf(externalPhase);

    // Nếu không tìm thấy trực tiếp, tìm theo canonicalPhaseId
    if (idx < 0) {
      idx = cyclePhaseConfigs.findIndex(
        (phase) =>
          phase.canonicalPhaseId === externalPhase ||
          normalizePhaseId(phase.phaseId) === externalPhase
      );
    }

    if (idx >= 0) {
      setTrailIndex(idx);
      // Cập nhật activePhase để sync với visual
      const matchedPhase = cyclePhaseConfigs[idx];
      if (matchedPhase) {
        setActivePhase((prev) =>
          prev !== matchedPhase.phaseId ? matchedPhase.phaseId : prev
        );
      }
    }
  }, [
    value,
    phase1CompletedProp,
    cyclePhaseIds,
    cyclePhaseConfigs,
    tree?.lifecycle?.currentPhaseId,
    tree?.phenology?.currentPhase,
    tree?.phenology?.stage,
    tree?.phase,
  ]);

  // Modal xác nhận (nhỏ)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPhase, setPendingPhase] = useState(null);
  const [confirmText, setConfirmText] = useState({
    title: "",
    message: "",
    highlight: "",
  });

  const [portalEl, setPortalEl] = useState(null);
  useEffect(() => {
    if (!portalId) return;
    const el = document.getElementById(portalId);
    setPortalEl(el || null);
  }, [portalId]);

  const buildSteps = (from, to) => {
    const steps = [];
    const N = cyclePhaseIds.length;
    if (N <= 0) return steps;
    const normalizedFrom = normalizePhaseId(from);
    console.log("[LifecycleWidget] buildSteps", { from, normalizedFrom, to });

    if (normalizedFrom === "growth_development" && isCyclePhase(to)) {
      steps.push({ type: "p1" });
      from = cyclePhaseIds[0] || "flowering";
    }

    const normalizedTo = normalizePhaseId(to);
    if (isCyclePhase(from) && normalizedTo === "growth_development") {
      // 1. Walk back to index 0
      let i = cyclePhaseIds.indexOf(from);
      const target = 0; // index of first cycle phase
      const N = cyclePhaseIds.length;
      if (i !== -1 && N > 0) {
        while (i !== target) {
          const prev = (i - 1 + N) % N;
          steps.push({
            type: "arc",
            from: cyclePhaseIds[i],
            to: cyclePhaseIds[prev],
          });
          i = prev;
        }
      }
      // 2. Add retract step
      steps.push({ type: "p1-retract" });
      return steps;
    }

    if (isCyclePhase(from) && isCyclePhase(to) && from !== to) {
      let i = cyclePhaseIds.indexOf(from),
        j = cyclePhaseIds.indexOf(to);
      if (i === -1 || j === -1) return steps;
      let dir;
      if ((i + 1) % N === j) dir = +1;
      // else if ((j + 1) % N === i) dir = -1; // Removed to prefer forward fill for 0->Max
      else dir = j > i ? +1 : -1;

      while (i !== j) {
        const next = (i + dir + N) % N;
        steps.push({
          type: "arc",
          from: cyclePhaseIds[i],
          to: cyclePhaseIds[next],
        });
        i = next;
      }
    }
    return steps;
  };

  const playSteps = async (steps, finalTo, shouldSpin) => {
    setTransitionFlow(null);
    setPreviewPhase(null);
    setSuppressId(null);
    setPostHideIdx(null);
    const DUR = 1150,
      DWELL = 200;

    const firstArc = steps.find((s) => s.type === "arc");
    const hasRetract = steps.some((s) => s.type === "p1-retract");

    if (hasRetract) {
      setIsBackwardRun(true);
    } else if (firstArc && cyclePhaseIds.length > 0) {
      const N = cyclePhaseIds.length;
      const iFrom = cyclePhaseIds.indexOf(firstArc.from);
      const iTo = cyclePhaseIds.indexOf(firstArc.to);
      if (iFrom === -1 || iTo === -1) setIsBackwardRun(false);
      else setIsBackwardRun((iFrom + 1) % N !== iTo);
    } else {
      setIsBackwardRun(false);
    }

    for (let idx = 0; idx < steps.length; idx++) {
      const s = steps[idx];
      if (s.type === "p1") {
        setP1Mode("grow");
        setP1Transition(true);
        setP1Key((k) => k + 1);
        await flush(); // Force render before wait
        await wait(950);
        setP1Transition(false);
        if (!isPhase1Completed) setIsPhase1Completed(true);
        if (cyclePhaseIds.length > 0) {
          setTrailIndex(0);
          setPreviewPhase(cyclePhaseIds[0]);
        }
        await flush(); // Force render updates
        await wait(DWELL);
        setPreviewPhase(null);
        continue;
      }

      if (s.type === "p1-retract") {
        setP1Mode("shrink");
        setP1Transition(true);
        setP1Key((k) => k + 1);

        // Hide trail immediately at 0
        setTrailIndex(-1);
        await flush();

        await wait(950);
        setP1Transition(false);
        setIsPhase1Completed(false);
        await flush();
        await wait(DWELL);
        continue;
      }

      const N = cyclePhaseIds.length;
      if (N <= 0) break;
      const iFrom = cyclePhaseIds.indexOf(s.from),
        iTo = cyclePhaseIds.indexOf(s.to);
      if (iFrom === -1 || iTo === -1) continue;
      const dir = (iFrom + 1) % N === iTo ? +1 : -1;

      if (dir === -1) {
        setSuppressId(s.from);
        await flush();
      }
      setTransitionFlow({ from: s.from, to: s.to });
      setTransitionKey((k) => k + 1);
      await wait(DUR);
      setTransitionFlow(null);
      setPostHideIdx(dir === -1 ? iTo : iFrom);
      setTimeout(() => setPostHideIdx(null), 130);
      await flush();

      if (dir === +1) {
        setPreviewPhase(s.to);
        await wait(DWELL);
        setTrailIndex(iTo);
        setPreviewPhase(null);
      } else {
        if (idx < steps.length - 1) setTrailIndex((iTo - 1 + N) % N);
        else setTrailIndex(iTo);
        await flush();
        setSuppressId(null);
        await wait(DWELL);
      }
    }

    setActivePhase(finalTo);
    setPreviewPhase(null);
    setSuppressId(null);
    setIsBackwardRun(false);
    if (shouldSpin) runSpinReset();
  };

  const activePhaseCanonical = useMemo(() => {
    const meta =
      findPhaseById(activePhase) || findPhaseByCanonical(activePhase);
    return meta?.canonicalPhaseId || normalizePhaseId(activePhase);
  }, [activePhase, findPhaseByCanonical, findPhaseById]);

  const requestChangePhase = useCallback(
    (targetPhaseInput, cause = "pick") => {
      if (isRunning) return;
      const targetPhase =
        typeof targetPhaseInput === "string"
          ? findPhaseById(targetPhaseInput) ||
          findPhaseByCanonical(normalizePhaseId(targetPhaseInput))
          : targetPhaseInput && typeof targetPhaseInput === "object"
            ? findPhaseById(
              targetPhaseInput.phaseId ||
              targetPhaseInput.id ||
              targetPhaseInput
            ) || targetPhaseInput
            : null;
      if (!targetPhase) return;
      const fromCanonical =
        findPhaseById(activePhase)?.canonicalPhaseId ||
        normalizePhaseId(activePhase);
      const toCanonical =
        targetPhase.canonicalPhaseId ||
        normalizePhaseId(targetPhase.phaseId || targetPhase.id);


      let title = "Xác nhận đổi giai đoạn";
      let message = `Bạn muốn chuyển từ "${labelOf(fromCanonical)}" sang "${targetPhase.name || labelOf(toCanonical)
        }"?`;
      let highlight = "";
      if (fromCanonical === "post_harvest" && toCanonical === "flowering")
        highlight = "Chuyển Sau thu hoạch → Ra Hoa sẽ BẮT ĐẦU MỘT CHU KỲ MỚI.";
      if (fromCanonical === "growth_development" && isCyclePhase(toCanonical))
        message = `Hoàn tất "${labelOf(
          fromCanonical
        )}" và chuyển sang "${labelOf(toCanonical)}"?`;
      if (cause === "start-new-cycle") {
        title = "Bắt đầu giai đoạn mới";
        message = "Chu kỳ mới sẽ khởi động và vòng xoay 1s.";
        const startLabel = cyclePhaseConfigs[0]?.label || labelOf("flowering");
        highlight = `Điểm bắt đầu: ${startLabel}.`;
      }
      setPendingPhase({
        phaseId: targetPhase.phaseId,
        canonicalPhaseId: toCanonical,
        stageId: targetPhase.stageId ?? null,
        label: targetPhase.name,
      });
      setConfirmText({ title, message, highlight });
      setConfirmOpen(true);
    },
    [
      isRunning,
      activePhase,
      cyclePhaseConfigs,
      findPhaseByCanonical,
      findPhaseById,
      labelOf,
      isCyclePhase,
    ]
  );

  /**
   * Update lifecycle using dedicated lifecycle API
   */
  async function updateLifecyclePhase(
    phaseId,
    cycleCountVal,
    phase1Completed,
    extra = {},
    stageId = null
  ) {
    // Use ref to get latest treeId (avoids stale closure issue)
    const currentTreeId = treeIdRef.current;
    if (!currentTreeId) {
      console.warn(
        "[LifecycleWidget] updateLifecyclePhase called but treeId is falsy:",
        currentTreeId,
        "(prop treeId:",
        treeId,
        ")"
      );
      return null;
    }

    try {
      // Đảm bảo phaseId gửi lên API luôn là 1 trong 5 giá trị chuẩn
      const normalizedPhaseId = normalizePhaseId(phaseId);

      const payload = {
        phaseId: normalizedPhaseId,
        ...(cycleCountVal != null && { cycleCount: cycleCountVal }),
        ...(phase1Completed != null && { phase1Completed }),
      };

      if (Object.prototype.hasOwnProperty.call(extra, "autoSyncEnabled")) {
        payload.autoSyncEnabled = extra.autoSyncEnabled;
      }
      if (extra?.overrideReason) {
        payload.overrideReason = extra.overrideReason;
      }
      if (stageId != null) {
        payload.stageId = stageId;
      }

      // If we have a target stage/phase, attempt to include virtualAgeMonths
      // so backend can set VirtualAgeMonths reliably. We try to derive a
      // sensible min age from the phase config subtitle (e.g. "18-20 tháng" or "≥18 tháng").
      const tryParseMinFromSubtitle = (subtitle) => {
        if (!subtitle) return null;
        // match first number in the subtitle
        const m = subtitle.match(/(\d{1,3})/);
        if (!m) return null;
        const v = parseInt(m[1], 10);
        return Number.isFinite(v) ? v : null;
      };

      let targetPhaseEntry = null;
      if (stageId != null) {
        targetPhaseEntry = findPhaseByStageId(stageId) || null;
      }
      if (!targetPhaseEntry && normalizedPhaseId) {
        targetPhaseEntry = findPhaseByCanonical(normalizedPhaseId) || null;
      }

      if (targetPhaseEntry) {
        // prefer explicit stage-level metadata if present
        const parsed = tryParseMinFromSubtitle(targetPhaseEntry.subtitle);
        if (parsed != null) {
          payload.virtualAgeMonths = parsed;
        }
      }

      // Log ra UI (console browser) để debug
      console.log("[LifecycleWidget] updateLifecyclePhase → sending payload", {
        treeId: currentTreeId,
        payload,
      });

      const response = await TreeRepository.updateLifecycle(
        currentTreeId,
        payload
      );
      const data = response?.data ?? response;
      console.log("[LifecycleWidget] updateLifecyclePhase ← response", {
        treeId: currentTreeId,
        payload,
        data,
      });
      return data;
    } catch (err) {
      console.error("[LifecycleWidget] Update lifecycle failed", err);
      throw err; // Re-throw to allow caller to handle
    }
  }

  async function handleToggleAutoSync() {
    if (!treeId || togglingAuto || disabled) return;

    const nextState = !autoSyncEnabled;
    let overrideReason = undefined;

    setTogglingAuto(true);
    try {
      const lifecycleResponse = await updateLifecyclePhase(
        activePhaseCanonical,
        cycleCount,
        isPhase1Completed,
        { autoSyncEnabled: nextState, overrideReason },
        activeStageId ?? null
      );

      const resolvedPhaseId = normalizePhaseId(
        lifecycleResponse?.phaseId ?? activePhaseCanonical
      );
      const resolvedCycleCount = lifecycleResponse?.cycleCount ?? cycleCount;
      const resolvedPhase1Completed =
        lifecycleResponse?.phase1Completed ?? isPhase1Completed;
      const resolvedStageId = lifecycleResponse?.stageId ?? null;
      const resolvedAutoEnabled =
        typeof lifecycleResponse?.lifecycleAutoEnabled === "boolean"
          ? lifecycleResponse.lifecycleAutoEnabled
          : nextState;
      const resolvedAutoDisabledAt =
        lifecycleResponse?.lifecycleAutoDisabledAt ??
        (resolvedAutoEnabled ? null : new Date().toISOString());

      const resolvedPhaseEntry =
        (resolvedStageId != null
          ? findPhaseByStageId(resolvedStageId)
          : findPhaseByCanonical(resolvedPhaseId)) || null;
      if (resolvedPhaseEntry) {
        setActivePhase(resolvedPhaseEntry.phaseId);
        setActiveStageId(resolvedPhaseEntry.stageId ?? resolvedStageId ?? null);
      } else {
        setActivePhase(resolvedPhaseId);
        if (resolvedStageId != null) setActiveStageId(resolvedStageId);
      }
      setCycleCount(resolvedCycleCount);
      setIsPhase1Completed(resolvedPhase1Completed);
      setAutoSyncEnabled(resolvedAutoEnabled);
      setAutoDisabledAt(resolvedAutoDisabledAt);

      if (typeof onChange === "function") {
        onChange({
          phaseId: resolvedPhaseId,
          cycleCount: resolvedCycleCount,
          phase1Completed: resolvedPhase1Completed,
          stageId: resolvedStageId,
          lifecycleAutoEnabled: resolvedAutoEnabled,
          lifecycleAutoDisabledAt: resolvedAutoDisabledAt,
        });
      }
    } catch (err) {
      console.error("Failed to toggle lifecycle automation", err);
    } finally {
      setTogglingAuto(false);
    }
  }

  const onConfirmModal = async () => {
    if (isRunning) return;
    const pending = pendingPhase;
    if (!pending) return;
    setConfirmOpen(false);
    setPendingPhase(null);
    await flush();
    setIsRunning(true);

    const fromPhaseId = activePhase;
    const fromCanonical =
      findPhaseById(fromPhaseId)?.canonicalPhaseId ||
      normalizePhaseId(fromPhaseId);
    const toPhaseId = pending.phaseId;
    const toCanonical = pending.canonicalPhaseId || normalizePhaseId(toPhaseId);
    const shouldSpin =
      (fromCanonical === "post_harvest" && toCanonical === "flowering") ||
      confirmText.title === "Bắt đầu giai đoạn mới";
    const steps = buildSteps(fromPhaseId, toPhaseId);

    console.log("[LifecycleWidget] onConfirmModal", {
      treeId,
      from: fromPhaseId,
      to: toPhaseId,
      pendingPhase,
      cycleCountBefore: cycleCount,
      isPhase1CompletedBefore: isPhase1Completed,
      steps,
    });

    // TÍNH TRẠNG THÁI MỚI (trước khi gọi API)
    const nextP1 = toCanonical !== "growth_development";

    // Nếu là Sau thu hoạch -> Ra Hoa thì tăng chu kỳ
    const nextCount =
      fromCanonical === "post_harvest" && toCanonical === "flowering"
        ? cycleCount + 1
        : cycleCount;

    const resolvePhaseIdForStage = (stageId, canonicalId, fallbackPhaseId) => {
      if (stageId != null) {
        const match = findPhaseByStageId(stageId);
        if (match) return match.phaseId;
      }
      if (canonicalId) {
        const match = findPhaseByCanonical(canonicalId);
        if (match) return match.phaseId;
      }
      return fallbackPhaseId || canonicalId || null;
    };

    // Gọi API lifecycle để cập nhật
    // Guard: if treeId is missing, skip API call but still run animations
    const currentTreeId = treeIdRef.current;
    if (!currentTreeId) {
      console.warn(
        "[LifecycleWidget] No treeId, skipping API call. treeIdRef.current:",
        currentTreeId,
        "prop treeId:",
        treeId
      );
      // Still run local state updates and animations
      setActivePhase(toPhaseId);
      setCycleCount(nextCount);
      setIsPhase1Completed(nextP1);
      if (steps.length > 0) {
        await playSteps(steps, toPhaseId, shouldSpin);
      }
      if (typeof onChange === "function") {
        onChange({
          phaseId: toCanonical,
          cycleCount: nextCount,
          phase1Completed: nextP1,
          stageId: pending.stageId ?? null,
        });
      }
      setIsRunning(false);
      return;
    }

    try {
      // Detect whether the visual transition will run backward (used to prompt for override)
      let extra = undefined;

      const lifecycleResponse = await updateLifecyclePhase(
        toCanonical,
        nextCount,
        nextP1,
        extra,
        pending.stageId ?? null
      );

      // Nếu API trả về dữ liệu, sử dụng dữ liệu từ API (single source of truth)
      if (lifecycleResponse) {
        const apiPhaseId =
          normalizePhaseId(lifecycleResponse.phaseId) || toCanonical;
        const apiCycleCount = lifecycleResponse.cycleCount ?? nextCount;
        const apiPhase1Completed = lifecycleResponse.phase1Completed ?? nextP1;
        const apiStageId = lifecycleResponse.stageId ?? pending.stageId ?? null;
        const apiVirtualAgeMonths = lifecycleResponse.virtualAgeMonths ?? lifecycleResponse.virtual_age_months ?? null;
        const apiAutoEnabled =
          typeof lifecycleResponse.lifecycleAutoEnabled === "boolean"
            ? lifecycleResponse.lifecycleAutoEnabled
            : autoSyncEnabled;
        const apiAutoDisabledAt =
          lifecycleResponse.lifecycleAutoDisabledAt ??
          (apiAutoEnabled ? null : autoDisabledAt);

        // Cập nhật state với dữ liệu từ API
        const resolvedPhaseId = resolvePhaseIdForStage(
          apiStageId,
          apiPhaseId,
          toPhaseId
        );
        if (resolvedPhaseId && steps.length === 0) {
          // Chỉ cập nhật phase ngay nếu KHÔNG chạy animation
          setActivePhase(resolvedPhaseId);
        }
        if (apiStageId != null) setActiveStageId(apiStageId);
        setCycleCount(apiCycleCount);

        // Nếu animation có bước P1, để animation tự handle việc set P1 completed
        const hasP1Step = steps.some((s) => s.type === "p1");
        if (!hasP1Step) {
          setIsPhase1Completed(apiPhase1Completed);
        }
        setAutoSyncEnabled(apiAutoEnabled);
        setAutoDisabledAt(apiAutoDisabledAt);

        // Nếu không có bước animation, vẫn phải tự cập nhật trail hợp lý
        if (steps.length === 0) {
          const targetId = resolvedPhaseId || toPhaseId;
          const resolvedIndex = cyclePhaseIds.indexOf(targetId);
          setTrailIndex(resolvedIndex);
        } else {
          await playSteps(steps, resolvedPhaseId || toPhaseId, shouldSpin);
        }

        // BẮN SỰ KIỆN RA PARENT với dữ liệu từ API
        if (typeof onChange === "function") {
          onChange({
            phaseId: apiPhaseId,
            cycleCount: apiCycleCount,
            phase1Completed: apiPhase1Completed,
            stageId: apiStageId,
            virtualAgeMonths: apiVirtualAgeMonths,
            lifecycleAutoEnabled: apiAutoEnabled,
            lifecycleAutoDisabledAt: apiAutoDisabledAt,
          });
        }
      } else {
        // Fallback nếu API không trả về dữ liệu
        const fallbackPhaseId = resolvePhaseIdForStage(
          pending.stageId ?? null,
          toCanonical,
          toPhaseId
        );
        if (fallbackPhaseId) setActivePhase(fallbackPhaseId);
        if (pending.stageId != null) setActiveStageId(pending.stageId);
        setCycleCount(nextCount);
        setIsPhase1Completed(nextP1);

        if (steps.length === 0) {
          if (
            fromCanonical === "growth_development" &&
            toCanonical === "growth_development"
          ) {
            // No change
          } else if (
            fromCanonical === "post_harvest" &&
            toCanonical === "flowering"
          ) {
            setTrailIndex(0);
            runSpinReset();
          } else {
            setTrailIndex(cyclePhaseIds.indexOf(fallbackPhaseId || toPhaseId));
          }
        } else {
          await playSteps(steps, fallbackPhaseId || toPhaseId, shouldSpin);
        }

        if (typeof onChange === "function") {
          onChange({
            phaseId: toCanonical,
            cycleCount: nextCount,
            phase1Completed: nextP1,
            stageId: pending.stageId ?? null,
            lifecycleAutoEnabled: autoSyncEnabled,
            lifecycleAutoDisabledAt: autoDisabledAt,
          });
        }
      }
    } catch (err) {
      console.error("Failed to update lifecycle", err);
      // TODO: show error toast / message to user
    }

    setIsRunning(false);
  };

  const nameSource = (meta?.name ?? tree?.name ?? "").trim();
  const varietySource = meta?.variety ?? tree?.variety ?? "—";
  const treeData = {
    id: treeId ?? tree?.id ?? "—", // ⬅️ đồng bộ với mã cây (codeKey)
    type: nameSource.split(/\s+/)[0] || "Cây",
    variety: varietySource,
    currentPhase: activePhase,
    cycleCount,
    isPhase1Completed,
    stageId:
      tree?.stageId ??
      tree?.lifecycle?.stageId ??
      meta?.stageId ??
      externalStageId ??
      null,
  };

  return (
    <div className="relative">
      {/* nút điều khiển căn giữa */}
      {!disabled &&
        (portalEl ? (
          createPortal(
            <LCPhaseDropdown
              activePhase={activePhase}
              onPickPhase={(phase) => requestChangePhase(phase, "pick")}
              onStartNewCycle={() =>
                cyclePhaseConfigs.length
                  ? requestChangePhase(cyclePhaseConfigs[0], "start-new-cycle")
                  : requestChangePhase("flowering", "start-new-cycle")
              }
              phaseConfigs={phaseConfigs}
              isPhase1Completed={isPhase1Completed}
            />,
            portalEl
          )
        ) : (
          <div className="flex justify-center mb-4">
            <LCPhaseDropdown
              activePhase={activePhase}
              onPickPhase={(phase) => requestChangePhase(phase, "pick")}
              onStartNewCycle={() =>
                cyclePhaseConfigs.length
                  ? requestChangePhase(cyclePhaseConfigs[0], "start-new-cycle")
                  : requestChangePhase("flowering", "start-new-cycle")
              }
              phaseConfigs={phaseConfigs}
              isPhase1Completed={isPhase1Completed}
            />
          </div>
        ))}
      {disabled && (
        <div className="flex justify-center mb-4">
          <span
            className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white bg-gray-400 cursor-not-allowed"
            title="Đã dừng hoạt động"
          >
            Cập nhật giai đoạn
          </span>
        </div>
      )}

      <div className="flex justify-center">
        <LifecycleTimeline
          activePhase={activePhase}
          previewPhase={previewPhase}
          isPhase1Completed={isPhase1Completed}
          isSpinning={isSpinning}
          treeData={treeData}
          treeId={treeId} // 👈 mã cây chuẩn
          treeType={displayType} // 👈 loại chuẩn
          treeVariety={displayVariety}
          transitionFlow={transitionFlow}
          transitionKey={transitionKey}
          p1Transition={p1Transition}
          p1Key={p1Key}
          p1Mode={p1Mode}
          trailIndex={trailIndex}
          suppressId={suppressId}
          isBackwardRun={isBackwardRun}
          postHideIdx={postHideIdx}
          onPhaseGateChange={onPhaseGateChange}
          phaseConfigs={phaseConfigs}
          editableNodes={enableNodeEditing}
          onNodeClick={onPhaseNodeClick}
          onNodeReorder={onPhaseNodeReorder}
        />
      </div>

      <LCConfirmModal
        open={confirmOpen}
        onClose={() => {
          if (!isRunning) {
            setConfirmOpen(false);
            setPendingPhase(null);
          }
        }}
        onConfirm={onConfirmModal}
        title={confirmText.title}
        message={confirmText.message}
        highlight={confirmText.highlight}
      />
    </div>
  );
}
