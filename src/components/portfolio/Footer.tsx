import { LinkPreview } from "@/components/ui/link-preview";
import { InstagramIcon, YouTubeIcon, ArrowUpRightIcon, EmailIcon, CodeIcon } from "@/components/ui/icons";

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
                  <InstagramIcon size={20} className="text-[#00a35c]" />
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Instagram</p>
                    <p className="text-neutral-500 text-xs">@shauncena17</p>
                  </div>
                </div>
                <ArrowUpRightIcon className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </LinkPreview>

              <LinkPreview
                url="https://youtube.com/@oma1036"
                className="group flex items-center justify-between border border-white/10 hover:border-red-500/40 rounded-2xl px-6 py-4 transition-all hover:bg-red-500/5 w-full"
              >
                <div className="flex items-center gap-3">
                  <YouTubeIcon size={20} className="text-red-500" />
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">YouTube</p>
                    <p className="text-neutral-500 text-xs">@oma1036</p>
                  </div>
                </div>
                <ArrowUpRightIcon className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </LinkPreview>

              <LinkPreview
                url="https://instagram.com/omai.design"
                className="group flex items-center justify-between border border-white/10 hover:border-[#a855f7]/40 rounded-2xl px-6 py-4 transition-all hover:bg-[#a855f7]/5 w-full"
              >
                <div className="flex items-center gap-3">
                  <InstagramIcon size={20} className="text-[#a855f7]" />
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Design Instagram</p>
                    <p className="text-neutral-500 text-xs">@omai.design</p>
                  </div>
                </div>
                <ArrowUpRightIcon className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </LinkPreview>

              <LinkPreview
                url="https://pupascii.vercel.app"
                className="group flex items-center justify-between border border-white/10 hover:border-[#06b6d4]/40 rounded-2xl px-6 py-4 transition-all hover:bg-[#06b6d4]/5 w-full"
              >
                <div className="flex items-center gap-3">
                  <CodeIcon size={20} className="text-[#06b6d4]" />
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">PupASCII</p>
                    <p className="text-neutral-500 text-xs">Collaborative project</p>
                  </div>
                </div>
                <ArrowUpRightIcon className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </LinkPreview>

              <a
                href="mailto:siashaun4@gmail.com"
                className="group flex items-center justify-between border border-white/10 hover:border-white/30 rounded-2xl px-6 py-4 transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <EmailIcon size={20} className="text-neutral-400" />
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Email</p>
                    <p className="text-neutral-500 text-xs">siashaun4@gmail.com</p>
                  </div>
                </div>
                <ArrowUpRightIcon className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
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
