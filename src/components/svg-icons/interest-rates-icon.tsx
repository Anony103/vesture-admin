export const InterestRateIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask
      id="mask0_interest_rate"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="24"
      height="24"
    >
      <rect width="24" height="24" fill="#D9D9D9" />
    </mask>

    <g mask="url(#mask0_interest_rate)">
      <path
        d="M7 17L17 7M9 9C9.552 9 10 8.552 10 8C10 7.448 9.552 7 9 7C8.448 7 8 7.448 8 8C8 8.552 8.448 9 9 9ZM15 17C15.552 17 16 16.552 16 16C16 15.448 15.552 15 15 15C14.448 15 14 15.448 14 16C14 16.552 14.448 17 15 17Z"
        fill="#8D8D8D"
      />

      {/* Upward trend arrow */}
      <path
        d="M5 14L9 10L13 14L19 8V11H21V5H15V7H18L13 12L9 8L3 14Z"
        fill="#8D8D8D"
      />
    </g>
  </svg>
);
