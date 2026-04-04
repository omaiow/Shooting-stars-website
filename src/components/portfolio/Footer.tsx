import { LinkPreview } from "@/components/ui/link-preview";

export function Footer() {
  return (
    <footer className="py-24 px-4 md:px-8 bg-black border-t border-white/5" id="contact">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-end">
          {/* Left */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-4 font-medium">Contact</p>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Let's work<br />
              <span className="text-[#00a35c]">together.</span>
            </h2>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <p className="text-neutral-400 leading-relaxed">
              Open for creative collaborations, design projects, and video work.
              Hit me up on social.
            </p>

            <div className="flex flex-col gap-3">
              <LinkPreview
                url="https://instagram.com/shauncena17"
                className="group flex items-center justify-between border border-white/10 hover:border-[#00a35c]/40 rounded-2xl px-6 py-4 transition-all hover:bg-[#00a35c]/5 w-full"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00a35c]">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Instagram</p>
                    <p className="text-neutral-500 text-xs">@shauncena17</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </LinkPreview>

              <LinkPreview
                url="https://youtube.com/@oma1036"
                className="group flex items-center justify-between border border-white/10 hover:border-red-500/40 rounded-2xl px-6 py-4 transition-all hover:bg-red-500/5 w-full"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                    <path d="M19.59 6.69a4.83 4.83 0 0 0-3.77-2.7C14.09 4 12 4 12 4s-2.09 0-3.82.27a4.83 4.83 0 0 0-3.77 2.7A26 26 0 0 0 4 12a26 26 0 0 0 .41 5.34 4.83 4.83 0 0 0 3.77 2.7C9.91 20.27 12 20 12 20s2.09 0 3.82-.27a4.83 4.83 0 0 0 3.77-2.7A26 26 0 0 0 20 12a26 26 0 0 0-.41-5.31zM10 15.5v-7l6 3.5z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">YouTube</p>
                    <p className="text-neutral-500 text-xs">@oma1036</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </LinkPreview>

              <LinkPreview
                url="https://instagram.com/omai.design"
                className="group flex items-center justify-between border border-white/10 hover:border-[#a855f7]/40 rounded-2xl px-6 py-4 transition-all hover:bg-[#a855f7]/5 w-full"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a855f7]">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Design Instagram</p>
                    <p className="text-neutral-500 text-xs">@omai.design</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </LinkPreview>

              <a
                href="mailto:siashaun4@gmail.com"
                className="group flex items-center justify-between border border-white/10 hover:border-white/30 rounded-2xl px-6 py-4 transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Email</p>
                    <p className="text-neutral-500 text-xs">siashaun4@gmail.com</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
          <span className="text-neutral-600 text-sm">© 2026 Shooting Stars Studio</span>
          <span className="text-neutral-600 text-sm">Shaun Sia — Omai</span>
        </div>
      </div>
    </footer>
  );
}
