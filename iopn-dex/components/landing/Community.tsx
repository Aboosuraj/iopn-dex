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
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="rounded-[2rem] border border-cyan-400/10 bg-cyan-400/[0.04] p-8 text-center md:p-12">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          Community
        </p>

        <h2 className="mt-4 text-4xl font-black md:text-5xl">
          Build the IOPn ecosystem with us
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/60">
          Follow development, share feedback and stay up to date as
          IOPn DEX evolves from Testnet toward Mainnet.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">

          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-black/20 p-6 transition hover:border-cyan-400/30 hover:bg-white/5"
            >
              <div className="text-xl font-black text-cyan-400">
                {link.name}
              </div>

              <p className="mt-2 text-sm text-white/50">
                {link.description}
              </p>
            </a>
          ))}

        </div>

      </div>
    </section>
  );
}