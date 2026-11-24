import { useState } from "react";

function blankPhoto(src) {
  return typeof src === "string" && src.startsWith("data:") && src.length < 1500;
}

export default function ItemImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed || blankPhoto(src)) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        {alt?.slice(0, 1)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (image.naturalWidth < 32 || image.naturalHeight < 32) setFailed(true);
      }}
    />
  );
}
