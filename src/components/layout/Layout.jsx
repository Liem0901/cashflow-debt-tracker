import { Outlet, useLocation } from 'react-router-dom';
import AppLogo from './AppLogo';
import BottomNav from '../navigation/BottomNav';
import FloatingActionButton from '../navigation/FloatingActionButton';
import AddTransactionModal from '../transactions/AddTransactionModal';
import { useApp } from '../../context/AppContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

export default function Layout() {
  const location = useLocation();
  const isAIPage = location.pathname.startsWith('/ai');
  const { refreshData, refreshing, addTransactionModal, closeAddTransaction } = useApp();
  const { pullDistance, isRefreshing, isTriggered } = usePullToRefresh(refreshData, {
    disabled: refreshing || isAIPage,
  });

  const showRefresh = pullDistance > 0 || isRefreshing || refreshing;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-black">
      {!isAIPage ? (
        <div className="app-top-bar px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
          <AppLogo />
        </div>
      ) : null}
      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: showRefresh ? `translateY(${pullDistance}px)` : undefined }}
      >
        {!isAIPage ? (
          <div
            className="flex items-center justify-center overflow-hidden text-portfolio-gray transition-[height] duration-200"
            style={{ height: showRefresh ? Math.max(pullDistance, 32) : 0 }}
            aria-hidden={!showRefresh}
          >
            <svg
              className={`h-5 w-5 ${isRefreshing || refreshing || isTriggered ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </div>
        ) : null}
        <main
          className={
            isAIPage
              ? 'flex h-[100dvh] flex-col overflow-hidden'
              : 'min-h-[calc(100dvh-4rem)] pb-24'
          }
        >
          <Outlet />
        </main>
      </div>
      <FloatingActionButton />
      <BottomNav />
      {addTransactionModal ? (
        <AddTransactionModal
          mode={addTransactionModal.mode}
          source={addTransactionModal.source}
          onClose={closeAddTransaction}
        />
      ) : null}
    </div>
  );
}
