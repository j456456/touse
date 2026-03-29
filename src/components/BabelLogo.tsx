export default function BabelLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Babel logo"
      >
        {/* Tower of Babel — minimalistic stacked tiers */}
        <rect x="26" y="4" width="12" height="10" rx="1" stroke="black" strokeWidth="2.5" fill="none" />
        <rect x="22" y="14" width="20" height="10" rx="1" stroke="black" strokeWidth="2.5" fill="none" />
        <rect x="18" y="24" width="28" height="10" rx="1" stroke="black" strokeWidth="2.5" fill="none" />
        <rect x="14" y="34" width="36" height="10" rx="1" stroke="black" strokeWidth="2.5" fill="none" />
        <rect x="10" y="44" width="44" height="10" rx="1.5" stroke="black" strokeWidth="2.5" fill="none" />
        {/* Base platform */}
        <line x1="6" y1="58" x2="58" y2="58" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-xl font-bold tracking-tight select-none">
        <span className="font-sans">Ba</span>
        <span className="font-serif font-bold">bel</span>
      </span>
    </div>
  );
}
