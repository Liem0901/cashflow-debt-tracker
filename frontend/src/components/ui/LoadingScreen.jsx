import WalkingRobotLoader from './WalkingRobotLoader';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 animate-fade-in">
      <WalkingRobotLoader />
      <p className="mt-2 text-sm text-portfolio-gray">Loading your data...</p>
    </div>
  );
}
