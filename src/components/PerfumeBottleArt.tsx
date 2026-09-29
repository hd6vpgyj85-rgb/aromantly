import "./PerfumeBottleArt.css";

/**
 * Frasco de perfume dibujado a mano en SVG, para acompañar los estados
 * vacíos (carrito sin nada, página no encontrada) en vez de dejarlos
 * como puro texto. Flota despacio y le cruza un brillo cada tanto.
 */
export default function PerfumeBottleArt() {
  return (
    <div className="bottle-art" aria-hidden="true">
      <svg viewBox="0 0 120 170" fill="none">
        {/* atomizador */}
        <rect x="50" y="6" width="20" height="16" rx="4" className="bottle-cap" />
        <rect x="55" y="22" width="10" height="14" className="bottle-neck" />

        {/* cuerpo del frasco */}
        <path
          d="M28 54c0-10 8-18 18-18h28c10 0 18 8 18 18v78c0 10-8 18-18 18H46c-10 0-18-8-18-18V54z"
          className="bottle-body"
        />

        {/* perfume adentro */}
        <path
          d="M31 100h58v32c0 8.3-6.7 15-15 15H46c-8.3 0-15-6.7-15-15v-32z"
          className="bottle-liquid"
        />

        {/* reflejo del vidrio */}
        <rect x="41" y="64" width="7" height="40" rx="3.5" className="bottle-glare" />
      </svg>
    </div>
  );
}
