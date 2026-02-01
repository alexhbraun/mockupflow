'use client';
import React from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, ...props }) => {
  const router = useNextRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Link clicked, navigating to:', href);
    try {
      router.push(href);
      console.log('Navigation successful');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if Next.js router fails
      window.location.href = href;
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
export default Link;