/** Lightweight markdown: bold, lists, tables (basic), line breaks */
export default function MarkdownText({ content, className = '' }) {
  const lines = content.split('\n');
  const elements = [];
  let tableRows = [];
  let inTable = false;

  const flushTable = (key) => {
    if (tableRows.length < 2) {
      tableRows.forEach((row, i) => {
        elements.push(
          <p key={`${key}-t-${i}`} className="text-sm text-portfolio-light">
            {row.join(' | ')}
          </p>
        );
      });
    } else {
      elements.push(
        <div key={key} className="my-2 overflow-x-auto rounded-xl border border-portfolio-border">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-portfolio-border bg-portfolio-elevated">
                {tableRows[0].map((cell, i) => (
                  <th key={i} className="px-3 py-2 font-medium text-portfolio-gray">
                    {renderInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(2).map((row, ri) => (
                <tr key={ri} className="border-b border-portfolio-border/50 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-portfolio-light">
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('|')) {
      inTable = true;
      tableRows.push(line.split('|').filter(Boolean));
      return;
    }
    if (inTable) flushTable(`table-${index}`);

    if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-4 list-disc text-sm text-portfolio-light">
          {renderInline(line.slice(2))}
        </li>
      );
      return;
    }

    if (!line.trim()) {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    elements.push(
      <p key={index} className="text-sm leading-relaxed text-portfolio-light">
        {renderInline(line)}
      </p>
    );
  });

  if (inTable) flushTable('table-end');

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      return (
        <span key={i} className="font-semibold text-metric-debt">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}
