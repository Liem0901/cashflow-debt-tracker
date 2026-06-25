import { getCategoryIcon, getIncomeSourceIcon, INCOME_SOURCE_CONFIG } from '../../data/initialData';

export default function CategoryIcon({ category, className = 'text-xl' }) {
  const icon = INCOME_SOURCE_CONFIG[category]
    ? getIncomeSourceIcon(category)
    : getCategoryIcon(category);
  return <i className={`bi ${icon} ${className}`} aria-hidden="true" />;
}
