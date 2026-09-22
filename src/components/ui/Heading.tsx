import React, { FC, JSX, ReactNode } from 'react';

type HeadingProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
};

const baseStyles: Record<number, string> = {
  1: 'text-[40px] font-bold text-[#151515] max-mb-xl:text-[26px] max-tab-lg:text-[32px] ',
  2: 'text-[32px] text-[#151515] font-semibold',
  3: "",
  4: '',
  5: '',
  6: '',
};

const Heading: FC<HeadingProps> = ({ level = 1, children, className = '' }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const headingClass = `${baseStyles[level] || baseStyles[1]} ${className}`;

  return <Tag className={headingClass}>{children}</Tag>;
};

export default Heading;
        