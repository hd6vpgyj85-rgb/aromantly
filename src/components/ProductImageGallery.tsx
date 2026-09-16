import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ProductImageGallery.css";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const list = images.length > 0 ? images : [];

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "start" });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(index);
  };

  if (list.length === 0) {
    return <div className="product-gallery-placeholder" />;
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery-track" ref={trackRef} onScroll={handleScroll}>
        {list.map((src, index) => (
          <button
            key={index}
            type="button"
            className="product-gallery-slide"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img src={src} alt={`${alt} ${index + 1}`} />
          </button>
        ))}
      </div>

      {list.length > 1 && (
        <div className="product-gallery-dots">
          {list.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`carousel-dot ${index === activeIndex ? "carousel-dot-active" : ""}`}
              aria-label={`Ver imagen ${index + 1}`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}

      {list.length > 1 && (
        <div className="product-gallery-thumbs">
          {list.map((src, index) => (
            <button
              key={index}
              type="button"
              className={`product-gallery-thumb ${index === activeIndex ? "product-gallery-thumb-active" : ""}`}
              onClick={() => scrollToIndex(index)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen &&
        createPortal(
          <div className="lightbox" onClick={() => setIsLightboxOpen(false)}>
            <button className="lightbox-close" aria-label="Cerrar" onClick={() => setIsLightboxOpen(false)}>
              ×
            </button>
            <img src={list[activeIndex]} alt={alt} onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
        )}
    </div>
  );
}
