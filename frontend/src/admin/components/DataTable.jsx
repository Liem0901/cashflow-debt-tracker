export default function DataTable({ columns, rows, emptyMessage = 'No data' }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-8 text-center text-sm text-portfolio-gray">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-portfolio-border bg-portfolio-card">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-portfolio-border text-xs uppercase tracking-wide text-portfolio-gray">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-b border-portfolio-border/60 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-portfolio-light">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
