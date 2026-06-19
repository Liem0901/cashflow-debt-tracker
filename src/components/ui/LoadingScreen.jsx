export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-portfolio-border border-t-white" />
      <p className="mt-4 text-sm text-portfolio-gray">Loading your data...</p>
    </div>
  );
}
