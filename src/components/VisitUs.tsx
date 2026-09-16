import { storeInfo } from "../data/store";
import "./VisitUs.css";

export default function VisitUs() {
  return (
    <section className="visit-us">
      <div className="container visit-us-grid">
        <div className="visit-us-photo" role="img" aria-label="Interior de la tienda Aromantly con perfumes en exhibición" />
        <div className="visit-us-info">
          <h2>Huele bello pal camello</h2>
          <p className="visit-us-address">{storeInfo.address}</p>
          <ul className="visit-us-schedule">
            {storeInfo.scheduleLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
