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
import { InstagramIcon, YouTubeIcon } from '../ui/icons';
import { scrollToSection } from '@/lib/scroll';

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
        scrollToSection('#hero');
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
        <InstagramIcon size={15} />
      </a>
      <a
        href="https://youtube.com/@oma1036"
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
        aria-label="YouTube @oma1036"
      >
        <YouTubeIcon size={15} />
      </a>
    </div>
  );
}

export function MainSite() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      scrollToSection(href);
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
