import React from "react";

const IconProfile = ({
  className = "",
  fill = "transparent",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <div className="flex  h-full">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill={fill}
      >
        <path
          d="M15.6667 18.1667V16.5C15.6667 15.6159 15.3155 14.7681 14.6904 14.143C14.0652 13.5179 13.2174 13.1667 12.3333 13.1667H7.33333C6.44928 13.1667 5.60143 13.5179 4.97631 14.143C4.35119 14.7681 4 15.6159 4 16.5V18.1667"
          stroke="#151515"
          strokeLinejoin="round"
        />
        <path
          d="M9.99996 10.1667C11.8409 10.1667 13.3333 8.67428 13.3333 6.83333C13.3333 4.99238 11.8409 3.5 9.99996 3.5C8.15901 3.5 6.66663 4.99238 6.66663 6.83333C6.66663 8.67428 8.15901 10.1667 9.99996 10.1667Z"
          stroke="#151515"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default IconProfile;
