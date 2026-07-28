export default function WalkingRobotLoader() {
  return (
    <div className="relative flex h-28 w-36 items-end justify-center" aria-hidden>
      <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="robot-loader">
        <svg viewBox="0 0 120 120" className="h-24 w-24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g className="robot-loader__shadow" opacity="0.2">
            <ellipse cx="60" cy="108" rx="20" ry="3.5" fill="#ffffff" />
          </g>

          <g className="robot-loader__body" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round">
            <rect x="40" y="46" width="40" height="36" rx="12" fill="#ffffff" />
            <rect x="46" y="54" width="28" height="14" rx="5" fill="#000000" stroke="none" />
            <circle cx="54" cy="61" r="2.5" fill="#ffffff" stroke="none" />
            <circle cx="66" cy="61" r="2.5" fill="#ffffff" stroke="none" />

            <g className="robot-loader__antenna" strokeLinecap="round">
              <line x1="60" y1="46" x2="60" y2="34" />
              <circle cx="60" cy="31" r="3" fill="#ffffff" className="robot-loader__antenna-bulb" stroke="none" />
            </g>

            <g className="robot-loader__arm robot-loader__arm--left">
              <rect x="26" y="58" width="10" height="7" rx="3.5" fill="#ffffff" />
              <rect x="20" y="64" width="7" height="12" rx="3.5" fill="#ffffff" />
            </g>

            <g className="robot-loader__arm robot-loader__arm--right">
              <rect x="84" y="58" width="10" height="7" rx="3.5" fill="#ffffff" />
              <rect x="93" y="64" width="7" height="12" rx="3.5" fill="#ffffff" />
            </g>

            <g className="robot-loader__leg robot-loader__leg--left">
              <rect x="48" y="80" width="8" height="14" rx="4" fill="#ffffff" />
              <rect x="45" y="92" width="12" height="5" rx="2.5" fill="#ffffff" />
            </g>

            <g className="robot-loader__leg robot-loader__leg--right">
              <rect x="64" y="80" width="8" height="14" rx="4" fill="#ffffff" />
              <rect x="63" y="92" width="12" height="5" rx="2.5" fill="#ffffff" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
