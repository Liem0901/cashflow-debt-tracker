export default function RobotIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3.75H15M9 3.75A2.25 2.25 0 017.5 6v1.5M9 3.75A2.25 2.25 0 0111.25 6v1.5M15 3.75A2.25 2.25 0 0116.5 6v1.5M15 3.75A2.25 2.25 0 0112.75 6v1.5M7.5 7.5H16.5C17.7426 7.5 18.75 8.50736 18.75 9.75V15.75C18.75 16.9926 17.7426 18 16.5 18H7.5C6.25736 18 5.25 16.9926 5.25 15.75V9.75C5.25 8.50736 6.25736 7.5 7.5 7.5Z"
      />
      <circle cx="9.75" cy="12.75" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14.25" cy="12.75" r="0.75" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" d="M9.75 15.75H14.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18V20.25M8.25 20.25H15.75" />
    </svg>
  );
}
