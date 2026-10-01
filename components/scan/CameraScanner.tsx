import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CameraScannerProps {
  /** Called with the decoded text once per newly-seen code. */
  onDetected: (text: string) => void;
}

// Ignore a re-detection of the same code while it's still sitting in frame —
// otherwise a barcode held in view fires the same scan dozens of times a
// second.
const SAME_CODE_COOLDOWN_MS = 2000;

/**
 * Optional camera-based scan input for devices without a dedicated barcode
 * scanner (laptop/tablet/phone camera) — off by default, toggled on demand,
 * so a plain USB scanner keyboard-wedge into the text field below still
 * works exactly as before.
 */
export default function CameraScanner({ onDetected }: CameraScannerProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastDetectionRef = useRef<{ text: string; time: number } | null>(
    null,
  );

  useEffect(() => {
    if (!active || !videoRef.current) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    setError(null);

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (cancelled || !result) return;

        const text = result.getText();
        const now = Date.now();
        const last = lastDetectionRef.current;
        if (
          last &&
          last.text === text &&
          now - last.time < SAME_CODE_COOLDOWN_MS
        ) {
          return;
        }
        lastDetectionRef.current = { text, time: now };
        onDetected(text);
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      })
      .catch(() => {
        if (!cancelled) setError(t("scan.cameraError"));
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onDetected]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("scan.cameraLabel")}
        </span>
        <Button
          type="button"
          variant={active ? "secondary" : "outline"}
          size="sm"
          onClick={() => setActive((a) => !a)}
          data-cy="scan_camera_toggle"
          className="gap-1.5"
        >
          {active ? (
            <CameraOff className="h-3.5 w-3.5" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
          {active ? t("scan.cameraStop") : t("scan.cameraStart")}
        </Button>
      </div>

      {active && (
        <div
          className="relative w-full aspect-video rounded-md overflow-hidden border border-border bg-black"
          data-cy="scan_camera_preview"
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive" data-cy="scan_camera_error">
          {error}
        </p>
      )}
    </div>
  );
}
