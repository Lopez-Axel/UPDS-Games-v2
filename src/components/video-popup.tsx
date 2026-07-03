"use client";

import { useRef, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";

interface VideoPopupProps {
  open: boolean;
  onComplete: () => void;
}

export function VideoPopup({ open, onComplete }: VideoPopupProps) {
  const doneRef = useRef(false);

  useEffect(() => {
    if (!open) doneRef.current = false;
  }, [open]);

  return (
    <Dialog.Root open={open} disablePointerDismissal>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup className="w-[90vw] max-w-lg bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative overflow-hidden">
            <video
              src="/video.mp4"
              muted
              playsInline
              autoPlay
              preload="auto"
              className="w-full h-auto block"
              style={{
                clipPath: "inset(10% 0 0 0)",
                transform: "scaleY(1.112)",
              }}
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                if (video.currentTime >= 4 && !doneRef.current) {
                  doneRef.current = true;
                  video.pause();
                  onComplete();
                }
              }}
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
