// Video Work section — embedded YouTube videos
const VIDEOS = [
  { id: 'jr6pgriP5W8', title: 'Video Edit #1' },
  { id: '5MIPImPRnGM', title: 'Video Edit #2' },
  { id: '7LpBqhtV3y8', title: 'Video Edit #3' },
];

export function VideoSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#030712]" id="work">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2 font-medium">Video</p>
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Video Work</h2>
          <a
            href="https://youtube.com/@oma1036"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-4 py-2 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
              <path d="M19.59 6.69a4.83 4.83 0 0 0-3.77-2.7C14.09 4 12 4 12 4s-2.09 0-3.82.27a4.83 4.83 0 0 0-3.77 2.7A26 26 0 0 0 4 12a26 26 0 0 0 .41 5.34 4.83 4.83 0 0 0 3.77 2.7C9.91 20.27 12 20 12 20s2.09 0 3.82-.27a4.83 4.83 0 0 0 3.77-2.7A26 26 0 0 0 20 12a26 26 0 0 0-.41-5.31zM10 15.5v-7l6 3.5z" />
            </svg>
            @oma1036
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VIDEOS.map((video) => (
            <div
              key={video.id}
              className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-[#00a35c]/30 transition-all duration-300"
              style={{ background: '#0a0a0a' }}
            >
              {/* 16:9 iframe wrapper */}
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {['CapCut', 'DaVinci Resolve', 'Edits', '@oma1036'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[#00a35c]/20 text-[#00a35c]/70 bg-[#00a35c]/5 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
