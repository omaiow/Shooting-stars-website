import { useEffect, useRef, useState } from 'react';

export function About() {
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
              with extensive experience leading creative teams.
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                @shauncena17
              </a>
              <a
                href="https://youtube.com/@oma1036"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-full px-4 py-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 0-3.77-2.7C14.09 4 12 4 12 4s-2.09 0-3.82.27a4.83 4.83 0 0 0-3.77 2.7A26 26 0 0 0 4 12a26 26 0 0 0 .41 5.34 4.83 4.83 0 0 0 3.77 2.7C9.91 20.27 12 20 12 20s2.09 0 3.82-.27a4.83 4.83 0 0 0 3.77-2.7A26 26 0 0 0 20 12a26 26 0 0 0-.41-5.31zM10 15.5v-7l6 3.5z" />
                </svg>
                @oma1036
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
