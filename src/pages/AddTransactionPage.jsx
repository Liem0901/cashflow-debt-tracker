import AddTransaction from '../components/transactions/AddTransaction';

export default function AddTransactionPage() {
  return (
    <div className="page-padding animate-fade-in">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-white">Add Transaction</h1>
        <p className="text-sm text-portfolio-gray">Quick entry — tap category & amount</p>
      </header>
      <AddTransaction />
    </div>
  );
}
