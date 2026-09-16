import type { ActiveFilter } from "../types";
import "./ProductFilters.css";

interface FilterOption {
  type: "nivel" | "marca";
  value: string;
  label: string;
}

interface ProductFiltersProps {
  options: FilterOption[];
  activeFilter: ActiveFilter;
  onChange: (filter: ActiveFilter) => void;
}

export default function ProductFilters({ options, activeFilter, onChange }: ProductFiltersProps) {
  const isAllActive = activeFilter === null;

  return (
    <div className="product-filters">
      <button
        type="button"
        className={`filter-chip ${isAllActive ? "filter-chip-active" : ""}`}
        onClick={() => onChange(null)}
      >
        Todas
      </button>
      {options.map((opt) => {
        const isActive =
          activeFilter?.type === opt.type && activeFilter.value === opt.value;
        return (
          <button
            key={`${opt.type}-${opt.value}`}
            type="button"
            className={`filter-chip ${isActive ? "filter-chip-active" : ""}`}
            onClick={() => onChange({ type: opt.type, value: opt.value } as ActiveFilter)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
