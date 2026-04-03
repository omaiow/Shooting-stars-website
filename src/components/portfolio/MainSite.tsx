import { useState } from 'react';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from '../ui/resizable-navbar';
import { Hero } from './Hero';
import { VideoSection } from './VideoSection';
import { DesignSection } from './DesignSection';
import { PhotoSection } from './PhotoSection';
import { Tools } from './Tools';
import { About } from './About';
import { Footer } from './Footer';

const NAV_ITEMS = [
  { name: 'Video', link: '#work' },
  { name: 'Design', link: '#design' },
  { name: 'Photo', link: '#photo' },
  { name: 'About', link: '#about' },
  { name: 'Tools', link: '#tools' },
  { name: 'Contact', link: '#contact' },
];

function PortfolioLogo() {
  return (
    <a
      href="#hero"
      className="relative z-20 flex items-center gap-2 px-2 py-1"
      onClick={(e) => {
        e.preventDefault();
        document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
        <span className="text-[#00a35c] text-2xl leading-none">✦</span>
      </div>
      <span className="font-bold text-white text-sm tracking-wide">Shon</span>
    </a>
  );
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-1">
      <a
        href="https://instagram.com/shauncena17"
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Instagram @shauncena17"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      </a>
      <a
        href="https://youtube.com/@oma1036"
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
        aria-label="YouTube @oma1036"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 0-3.77-2.7C14.09 4 12 4 12 4s-2.09 0-3.82.27a4.83 4.83 0 0 0-3.77 2.7A26 26 0 0 0 4 12a26 26 0 0 0 .41 5.34 4.83 4.83 0 0 0 3.77 2.7C9.91 20.27 12 20 12 20s2.09 0 3.82-.27a4.83 4.83 0 0 0 3.77-2.7A26 26 0 0 0 20 12a26 26 0 0 0-.41-5.31zM10 15.5v-7l6 3.5z"/>
        </svg>
      </a>
    </div>
  );
}

export function MainSite() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="main-site bg-[#030712] min-h-screen">
      <Navbar className="fixed top-0 inset-x-0 z-50">
        {/* Desktop */}
        <NavBody>
          <PortfolioLogo />
          <NavItems items={NAV_ITEMS} onItemClick={() => setMobileOpen(false)} />
          <SocialLinks />
        </NavBody>

        {/* Mobile */}
        <MobileNav>
          <MobileNavHeader>
            <PortfolioLogo />
            <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.link}
                onClick={() => handleNavClick(item.link)}
                className="w-full text-left text-neutral-300 hover:text-white py-2 text-lg font-medium transition-colors"
              >
                {item.name}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 w-full">
              <SocialLinks />
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <Hero />
      <VideoSection />
      <DesignSection />
      <PhotoSection />
      <Tools />
      <About />
      <Footer />
    </div>
  );
}
