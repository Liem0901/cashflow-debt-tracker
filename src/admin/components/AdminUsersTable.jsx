import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import DataTable from './DataTable';

export default function AdminUsersTable({
  users,
  emptyMessage = 'No users found',
  onToggleDisabled,
  onDelete,
  showViewAction = true,
}) {
  return (
    <DataTable
      columns={[
        {
          key: 'name',
          label: 'Name',
          render: (row) => (
            <div className="min-w-[8rem]">
              <p className="font-medium text-white">{row.name}</p>
              {row.email ? <p className="text-xs text-portfolio-gray">{row.email}</p> : null}
            </div>
          ),
        },
        {
          key: 'userId',
          label: 'ID',
          render: (row) => (
            <code className="block max-w-[14rem] truncate text-xs text-portfolio-gray" title={row.userId}>
              {row.userId}
            </code>
          ),
        },
        {
          key: 'disabled',
          label: 'Status',
          render: (row) => (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                row.disabled ? 'bg-rose-950/50 text-rose-300' : 'bg-emerald-950/50 text-emerald-300'
              }`}
            >
              {row.disabled ? 'Disabled' : 'Active'}
            </span>
          ),
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              {showViewAction ? (
                <Link
                  to={`/admin/users/${encodeURIComponent(row.userId)}`}
                  className="inline-flex items-center justify-center rounded-xl bg-transparent px-3 py-1.5 text-sm text-portfolio-light transition-colors hover:bg-portfolio-elevated"
                >
                  View
                </Link>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => onToggleDisabled(row.userId, row.disabled)}>
                {row.disabled ? 'Enable' : 'Disable'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(row.userId, row.name)}>
                Delete
              </Button>
            </div>
          ),
        },
      ]}
      rows={users.map((row) => ({ ...row, id: row.userId }))}
      emptyMessage={emptyMessage}
    />
  );
}
