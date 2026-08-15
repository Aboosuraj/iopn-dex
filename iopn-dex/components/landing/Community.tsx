"use client";

export default function Community() {
  const links = [
    {
      name: "X",
      description: "Follow IOPn DEX updates",
      href: "https://x.com/IOPndex_xyz",
    },
    {
      name: "Discord",
      description: "Join the community",
      href: "https://discord.gg/",
    },
    {
      name: "GitHub",
      description: "Explore the project",
      href: "https://github.com/",
    },
  ];

  return (
    <section
      id="community"
      className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16"
    >
      {/* HEADER */}
      <div className="text-center">

        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
          Community
        </p>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Build the IOPn ecosystem with us
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-white/40 sm:text-sm">
          Follow development, share feedback and stay up to date as
          IOPn DEX evolves from Testnet toward Mainnet.
        </p>

      </div>


      {/* COMMUNITY CARDS */}
      <div className="mt-8 grid gap-2.5 sm:grid-cols-3">

        {links.map((link, index) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-4
              py-3.5
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-cyan-400/15
              hover:bg-white/[0.035]
            "
          >

            {/* subtle glow */}
            <div
              className="
                pointer-events-none
                absolute
                -right-8
                -top-8
                h-20
                w-20
                rounded-full
                bg-cyan-400/[0.05]
                blur-2xl
                transition
                group-hover:bg-cyan-400/[0.09]
              "
            />

            <div className="relative flex items-center gap-3">

              {/* NUMBER */}
              <span
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-cyan-400/[0.07]
                  text-[9px]
                  font-black
                  text-cyan-400
                "
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* CONTENT */}
              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h3 className="text-xs font-black text-white">
                    {link.name}
                  </h3>

                  <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-70" />

                </div>

                <p className="mt-0.5 truncate text-[10px] leading-4 text-white/35">
                  {link.description}
                </p>

              </div>

            </div>

          </a>
        ))}

      </div>


      {/* STATUS */}
      <div className="mt-6 flex items-center justify-center gap-2">

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

        <span className="text-[9px] font-medium text-white/25">
          Join the IOPn community
        </span>

      </div>

    </section>
  );
}