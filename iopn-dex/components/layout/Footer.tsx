"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#050816]">
      <div className="mx-auto max-w-6xl px-6 py-12">

        <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">

          <a
            href="https://faucet.iopn.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition"
          >
            Faucet
          </a>

          <a
            href="https://iopn.gitbook.io/iopn/developer-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition"
          >
            Documentation
          </a>

          <a
            href="https://testnet.iopn.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition"
          >
            Explorer
          </a>

          <a
            href="https://x.com/IOPndex_xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition"
          >
            𝕏 (Twitter)
          </a>

          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition"
          >
            Discord
          </a>

        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          Trade, swap, stake and explore assets on the IOPN Testnet ecosystem.
        </p>

        <p className="mt-6 text-center text-xs text-white/30">
          © {year} IOPn DEX • Built with 💜 on IOPN Chain
        </p>

      </div>
    </footer>
  );
}