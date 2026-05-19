import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4 flex-wrap">
      <FileText className="h-4 w-4" />
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />}
          {item.to ? <Link to={item.to} className="hover:text-forge-blue">{item.label}</Link> : <span className="text-neutral-900">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}