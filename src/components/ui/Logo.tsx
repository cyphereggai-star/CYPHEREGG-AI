const ORBITAL_LOGO = '/logo-black.png.png';

export function Logo({
  size = 'md',
  showText = true,
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}) {
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const text =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`relative ${dim} overflow-hidden rounded-full border border-accent-blue/40 bg-cyber-bg shadow-glow`}
      >
        <img
          src={ORBITAL_LOGO}
          alt="CypherEgg AI"
          className="h-full w-full object-cover"
        />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-cyber-text ${text}`}>
          Cypher<span className="text-accent-blue glow-text">Egg</span>
          <span className="ml-1 text-cyber-muted font-medium">AI</span>
        </span>
      )}
    </div>
  );
}
