import { useEffect, useRef, useState } from 'react';

const TOOLS = [
  { name: 'Photoshop', years: '9 years', color: '#31a8ff' },
  { name: 'DaVinci Resolve', years: '6 years', color: '#f97316' },
  { name: 'CapCut', years: '4 years', color: '#00a35c' },
  { name: 'Figma', years: '2 years', color: '#a259ff' },
  { name: 'Lightroom', years: 'personal', color: '#f59e0b' },
];

function ToolRow({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex items-center gap-6 py-6 border-b border-white/5 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`,
      }}
    >
      <span
        className="text-3xl md:text-4xl font-black tracking-tight w-64 flex-shrink-0 transition-colors duration-500"
        style={{ color: visible ? tool.color : '#1f2937' }}
      >
        {tool.name}
      </span>

      <div className="flex-1 relative h-px overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div
          className="absolute left-0 top-0 bottom-0 transition-all duration-1000"
          style={{
            width: visible ? '100%' : '0%',
            background: tool.color,
            transitionDelay: `${index * 100 + 300}ms`,
          }}
        />
      </div>

      <span
        className="text-sm font-mono flex-shrink-0 w-20 text-right transition-colors duration-500"
        style={{ color: visible ? 'rgba(255,255,255,0.4)' : 'transparent' }}
      >
        {tool.years}
      </span>
    </div>
  );
}

export function Tools() {
  return (
    <section className="py-24 px-4 md:px-8 bg-black" id="tools">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2 font-medium">Programs I Use</p>
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-16">Tools</h2>
        <div>
          {TOOLS.map((tool, i) => (
            <ToolRow key={tool.name} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
