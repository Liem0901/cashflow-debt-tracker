import { getCategoryIcon } from '../../data/initialData';

export default function CategoryButtons({ categories, selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((cat) => {
        const isSelected = selected === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition-all ${
              isSelected
                ? 'border-white bg-white text-black scale-[1.02]'
                : 'border-portfolio-border bg-portfolio-elevated text-portfolio-gray hover:border-portfolio-gray'
            }`}
          >
            <i className={`bi ${getCategoryIcon(cat)} text-2xl`} aria-hidden="true" />
            <span className="text-xs font-medium">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
