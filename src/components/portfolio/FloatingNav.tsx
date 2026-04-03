import { useEffect, useRef, useState } from 'react';

const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Tools', href: '#tools' },
  { label: 'Contact', href: '#contact' },
];

export function FloatingNav() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    // Fade in after mount
    const t = setTimeout(() => setVisible(true), 600);

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      lastY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`aceternity-nav${visible ? ' aceternity-nav--visible' : ''}${scrolled ? ' aceternity-nav--scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="aceternity-nav__pill">
        {/* Logo mark */}
        <span className="aceternity-nav__logo">SS</span>
        <div className="aceternity-nav__divider" />

        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="aceternity-nav__link"
            onClick={(e) => handleClick(e, link.href)}
          >
            {link.label}
          </a>
        ))}

        <div className="aceternity-nav__divider" />

        <a
          href="https://instagram.com/shauncena17"
          target="_blank"
          rel="noopener noreferrer"
          className="aceternity-nav__social"
          aria-label="Instagram @shauncena17"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a
          href="https://youtube.com/@oma1036"
          target="_blank"
          rel="noopener noreferrer"
          className="aceternity-nav__social"
          aria-label="YouTube @oma1036"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 0-3.77-2.7C14.09 4 12 4 12 4s-2.09 0-3.82.27a4.83 4.83 0 0 0-3.77 2.7A26 26 0 0 0 4 12a26 26 0 0 0 .41 5.34 4.83 4.83 0 0 0 3.77 2.7C9.91 20.27 12 20 12 20s2.09 0 3.82-.27a4.83 4.83 0 0 0 3.77-2.7A26 26 0 0 0 20 12a26 26 0 0 0-.41-5.31zM10 15.5v-7l6 3.5z"/>
          </svg>
        </a>
      </div>
    </nav>
  );
}
