"use client";

import { useReportWebVitals } from "next/web-vitals";

export const WEB_VITAL_EVENT = "relay:web-vital";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    window.dispatchEvent(
      new CustomEvent(WEB_VITAL_EVENT, {
        detail: metric,
      }),
    );
  });

  return null;
}
