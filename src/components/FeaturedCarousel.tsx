import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useProducts } from "../contexts/ProductsContext";
import { formatPrice } from "../utils/product";
import "./FeaturedCarousel.css";

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function FeaturedCarousel() {
  const { products } = useProducts();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasCentered, setHasCentered] = useState(false);

  const featured: Product[] = useMemo(() => pickRandom(products, Math.min(8, products.length)), [products]);

  useEffect(() => {
    setHasCentered(false);
  }, [featured]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || featured.length === 0 || hasCentered) return;

    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      track.scrollLeft = (track.scrollWidth - track.clientWidth) / 2;
    } else {
      track.scrollLeft = 0;
    }
    setHasCentered(true);
  }, [featured, hasCentered]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;

      // En los extremos el padding lateral del track no alcanza a centrar
      // el primer/último thumbnail (haría falta la mitad del ancho del
      // viewport de padding), así que "el más cercano al centro" nunca
      // daba el índice 0 ni el último: se quedaba trabado en el segundo
      // o el penúltimo. Por eso los extremos del scroll se detectan aparte.
      if (track.scrollLeft <= 1) {
        setActiveIndex(0);
        return;
      }
      if (track.scrollLeft >= maxScroll - 1) {
        setActiveIndex(track.children.length - 1);
        return;
      }

      const children = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      children.forEach((child, index) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(childCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => track.removeEventListener("scroll", handleScroll);
  }, [featured]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    if (!child) return;
    track.scrollTo({
      left: child.offsetLeft - (track.clientWidth - child.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  const goPrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const goNext = () => scrollToIndex(Math.min(featured.length - 1, activeIndex + 1));

  if (featured.length === 0) return null;

  const activeProduct = featured[activeIndex];

  return (
    <section className="featured-carousel">
      <div className="container">
        <h2 className="featured-carousel-title">Productos destacados</h2>
      </div>

      <div className="featured-carousel-viewport">
        <button
          type="button"
          className="carousel-arrow carousel-arrow-left"
          onClick={goPrev}
          aria-label="Anterior"
        >
          ‹
        </button>

        <div className="featured-carousel-track" ref={trackRef}>
          {featured.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={`featured-carousel-item ${index === activeIndex ? "featured-carousel-item-active" : ""}`}
              onClick={() => scrollToIndex(index)}
            >
              <div className="featured-carousel-thumb">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} loading="lazy" />
                ) : (
                  <div className="featured-carousel-thumb-placeholder" />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="carousel-arrow carousel-arrow-right"
          onClick={goNext}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      <div className="featured-carousel-dots">
        {featured.map((product, index) => (
          <button
            key={product.id}
            type="button"
            className={`carousel-dot ${index === activeIndex ? "carousel-dot-active" : ""}`}
            aria-label={`Ver ${product.name}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>

      {activeProduct && (
        <div className="featured-carousel-caption">
          <span className="featured-carousel-tag">Top venta</span>
          <h3>{activeProduct.name}</h3>
          <p className="featured-carousel-price">{formatPrice(activeProduct.price)}</p>
          <Link to={`/producto/${activeProduct.id}`} className="btn btn-primary">
            Ver producto
          </Link>
        </div>
      )}
    </section>
  );
}
