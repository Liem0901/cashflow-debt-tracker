import { getCategoryIcon } from '../../data/initialData';

export default function CategoryIcon({ category, className = 'text-xl' }) {
  return <i className={`bi ${getCategoryIcon(category)} ${className}`} aria-hidden="true" />;
}
