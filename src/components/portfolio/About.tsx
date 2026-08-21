import { useEffect, useRef, useState, memo } from 'react';
import { InstagramIcon, YouTubeIcon } from '../ui/icons';

export const About = memo(function About() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-4 md:px-8 bg-[#030712]" id="about" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-12 font-medium">About</p>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — large quote */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
            }}
          >
            <h2 className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tight">
              Design.<br />
              <span className="text-[#00a35c]">Video.</span><br />
              Creative.
            </h2>
          </div>

          {/* Right — bio */}
          <div
            className="space-y-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(30px)',
              transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
            }}
          >
            <p className="text-neutral-300 text-lg leading-relaxed">
              Hi! I'm <span className="text-white font-semibold">Shaun Sia</span>, otherwise known as{' '}
              <span className="text-[#00a35c] font-semibold">Omai</span> online. I'm a Graphic Designer
              and UI/UX Designer with extensive experience leading creative teams.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              I specialize in <span className="text-white">Photoshop</span> for graphics and photo manipulation,
              create <span className="text-white">short-form video content</span> with CapCut and DaVinci Resolve,
              and dabble in photography as a creative pursuit.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              Currently in college, I'm leading creative committees for various campus organizations —
              just as I spearheaded the publication team in high school.
            </p>

            <div className="pt-4 flex gap-4">
              <a
                href="https://instagram.com/shauncena17"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-full px-4 py-2"
              >
                <InstagramIcon size={14} />
                @shauncena17
              </a>
              <a
                href="https://youtube.com/@oma1036"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-full px-4 py-2"
              >
                <YouTubeIcon size={14} />
                @oma1036
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
