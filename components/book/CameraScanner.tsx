import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { isIsbnLike, normalizeIsbn } from "@/lib/isbn-services/types";
import { Camera, CameraOff, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraScannerProps {
  onDetected: (isbn: string) => void;
  onClose: () => void;
}

export default function CameraScanner({
  onDetected,
  onClose,
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const cancelledRef = useRef(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }, []);

  const startScanner = useCallback(
    async (deviceId?: string) => {
      if (!videoRef.current) return;
      cancelledRef.current = false;
      stopScanner();
      setError(null);

      const reader = new BrowserMultiFormatReader();

      try {
        setScanning(true);
        // Local flag prevents duplicate detections if the callback fires
        // before the outer await resolves (controlsRef not yet assigned).
        let detected = false;
        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (detected) return;
            if (result) {
              const text = result.getText();
              if (isIsbnLike(text)) {
                detected = true;
                controlsRef.current?.stop();
                controlsRef.current = null;
                setScanning(false);
                onDetected(normalizeIsbn(text));
              }
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn("Scanner:", err);
            }
          },
        );
        // If detection fired before controls was returned, or the component
        // was closed/unmounted while awaiting, stop the stream now — otherwise
        // controlsRef would hold a stream nobody stops (camera stays on).
        if (detected || cancelledRef.current) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      } catch (e: any) {
        setScanning(false);
        if (e?.name === "NotAllowedError") {
          setError("Kamerazugriff verweigert. Bitte Berechtigung erteilen.");
        } else if (e?.name === "NotFoundError") {
          setError("Keine Kamera gefunden.");
        } else {
          setError("Kamera konnte nicht gestartet werden.");
        }
      }
    },
    [stopScanner, onDetected],
  );

  useEffect(() => {
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        const back = d.find((dev) => /back|rear|environment/i.test(dev.label));
        const initial = back?.deviceId ?? d[0]?.deviceId;
        setSelectedDeviceId(initial);
        startScanner(initial);
      })
      .catch(() => setError("Kamerazugriff nicht möglich."));

    return () => {
      cancelledRef.current = true;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const idx = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const next = devices[(idx + 1) % devices.length];
    setSelectedDeviceId(next.deviceId);
    startScanner(next.deviceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <span className="text-white text-sm font-medium">ISBN scannen</span>
        <div className="flex items-center gap-2">
          {devices.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
              aria-label="Kamera wechseln"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => { stopScanner(); onClose(); }}
            className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />

        {scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-72 h-40">
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <span
                  key={corner}
                  className={`absolute w-8 h-8 border-white border-4
                    ${corner === "tl" ? "top-0 left-0 border-r-0 border-b-0 rounded-tl-md" : ""}
                    ${corner === "tr" ? "top-0 right-0 border-l-0 border-b-0 rounded-tr-md" : ""}
                    ${corner === "bl" ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-md" : ""}
                    ${corner === "br" ? "bottom-0 right-0 border-l-0 border-t-0 rounded-br-md" : ""}
                  `}
                />
              ))}
              <div
                className="absolute left-1 right-1 h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]"
                style={{ top: "50%" }}
              />
            </div>
            <p className="absolute bottom-8 text-white/80 text-sm text-center px-4">
              Barcode in den Rahmen halten
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70">
            <CameraOff className="h-12 w-12 text-white/50" />
            <p className="text-white text-sm text-center px-8">{error}</p>
            <button
              onClick={() => startScanner(selectedDeviceId)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm"
            >
              <Camera className="h-4 w-4" />
              Erneut versuchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
