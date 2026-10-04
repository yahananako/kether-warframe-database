"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/** Preserve original artwork; keep the layout usable if its host fails. */
export default function StoryArtwork({
  alt = "",
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const image = useRef<HTMLImageElement>(null);
  const [failedSource, setFailedSource] = useState<ImgHTMLAttributes<HTMLImageElement>["src"]>();
  const fallback = Boolean(src && failedSource === src);
  useEffect(() => {
    if (image.current?.complete && !image.current.naturalWidth)
      setFailedSource(src);
  }, [src]);
  return (
    <img
      {...props}
      ref={image}
      src={fallback ? "/story-artwork-unavailable.svg" : src}
      alt={fallback ? `${alt || "故事插圖"}（影像暫時無法載入）` : alt}
      data-fallback={fallback || undefined}
      onError={() => {
        if (!fallback) setFailedSource(src);
      }}
    />
  );
}
