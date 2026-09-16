import "./CategoryPhotoBanner.css";

interface CategoryPhotoBannerProps {
  title: string;
  tagline: string;
  image?: string;
}

export default function CategoryPhotoBanner({ title, tagline, image }: CategoryPhotoBannerProps) {
  return (
    <div
      className="category-photo-banner"
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="category-photo-banner-overlay" />
      <div className="container category-photo-banner-content">
        <h1>{title}</h1>
        <p>{tagline}</p>
      </div>
    </div>
  );
}
