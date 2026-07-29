import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/** Deep link handler — opens the bottom sheet and returns to the previous screen. */
export default function AddTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openAddTransaction } = useApp();

  useEffect(() => {
    openAddTransaction({
      mode: searchParams.get('mode') || 'cash',
      source: searchParams.get('source') || undefined,
    });
    navigate('/dashboard', { replace: true });
  }, [navigate, openAddTransaction, searchParams]);

  return null;
}
