"use client";

import { useEffect, useRef } from "react";

const SCRIPT = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_URL =
  "https://calendly.com/prakash-cyberinfosec/30min?hide_event_type_details=1&hide_gdpr_banner=1";

type CalendlyApi = {
  initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
};

export function CalendlyEmbed({ height = 700 }: { height?: number }) {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    let cancelled = false;

    const mount = () => {
      const calendly = (window as Window & { Calendly?: CalendlyApi }).Calendly;
      if (!calendly || cancelled || !parentRef.current) return false;
      parentRef.current.replaceChildren();
      calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: parentRef.current });
      return true;
    };

    if (mount()) return () => { cancelled = true; };

    let script = document.querySelector(`script[src="${SCRIPT}"]`) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
    const onLoad = () => { mount(); };
    script.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      script?.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div
      ref={parentRef}
      className="overflow-hidden rounded-[28px] border border-line bg-white shadow-lift"
      style={{ minWidth: 320, height }}
      aria-label="Book a 30 minute cybersecurity call"
    />
  );
}
