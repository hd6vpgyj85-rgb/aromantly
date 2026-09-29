import { useEffect, useRef, useState } from "react";
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
  const lightboxTrackRef = useRef<HTMLDivElement>(null);

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

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  // Posiciona el track del lightbox en la imagen activa al abrirlo, sin animación.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const track = lightboxTrackRef.current;
    if (!track) return;
    const child = track.children[activeIndex] as HTMLElement | undefined;
    if (child) {
      track.scrollLeft = child.offsetLeft;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen]);

  const handleLightboxScroll = () => {
    const track = lightboxTrackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(index);
  };

  const scrollLightboxToIndex = (index: number) => {
    const track = lightboxTrackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center" });
    setActiveIndex(index);
  };

  const goPrev = () => scrollLightboxToIndex(Math.max(0, activeIndex - 1));
  const goNext = () => scrollLightboxToIndex(Math.min(list.length - 1, activeIndex + 1));

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
            onClick={() => openLightbox(index)}
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
          <div className="lightbox">
            <button className="lightbox-close" aria-label="Cerrar" onClick={() => setIsLightboxOpen(false)}>
              ×
            </button>

            {list.length > 1 && (
              <button className="lightbox-arrow lightbox-arrow-left" aria-label="Anterior" onClick={goPrev}>
                ‹
              </button>
            )}

            <div className="lightbox-track" ref={lightboxTrackRef} onScroll={handleLightboxScroll}>
              {list.map((src, index) => (
                <div key={index} className="lightbox-slide">
                  <img src={src} alt={`${alt} ${index + 1}`} />
                </div>
              ))}
            </div>

            {list.length > 1 && (
              <button className="lightbox-arrow lightbox-arrow-right" aria-label="Siguiente" onClick={goNext}>
                ›
              </button>
            )}

            {list.length > 1 && (
              <div className="lightbox-dots">
                {list.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`carousel-dot ${index === activeIndex ? "carousel-dot-active" : ""}`}
                    aria-label={`Ver imagen ${index + 1}`}
                    onClick={() => scrollLightboxToIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
