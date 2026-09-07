import { cn } from "@/lib/utils";

/**
 * JobTrunk logo — an abstract geometric "career trunk".
 *
 * Concept: a container (trunk) holding the layers of a career (skills,
 * learning, experience), with a growth stem rising out of it into an
 * opportunity node. Works from 16×16 favicon to large app icon.
 */
export function JobTrunkLogo({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 shrink-0"
        role="img"
        aria-label="JobTrunk logo"
      >
        {/* Trunk body — open-top container */}
        <path
          d="M13 22 L13 36 C13 41 15 43 20 43 L28 43 C33 43 35 41 35 36 L35 22"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {/* Growth stem rising out of the trunk */}
        <path
          d="M24 20 L24 9"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="text-teal-600"
        />
        {/* Opportunity node on top */}
        <circle cx="24" cy="6.5" r="4" className="fill-teal-600" />
        {/* Skill layers inside the trunk */}
        <path
          d="M17 26 L31 26"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="text-primary"
          opacity="0.85"
        />
        <path
          d="M17 32 L28 32"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="text-emerald-600"
        />
        <path
          d="M17 38 L25 38"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="text-teal-600"
        />
        {/* Ecosystem node */}
        <circle cx="39" cy="26" r="2.4" className="fill-emerald-600" />
      </svg>
      {variant === "full" && (
        <span className="font-bold tracking-tight leading-none">
          <span className="text-foreground">Job</span>
          <span className="text-primary">Trunk</span>
        </span>
      )}
    </span>
  );
}

/** Favicon-grade standalone mark (SVG string for data URIs). */
export const JOBTRUNK_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#1d4ed8"/>
  <path d="M13 22 L13 36 C13 41 15 43 20 43 L28 43 C33 43 35 41 35 36 L35 22" stroke="#ffffff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 20 L24 9" stroke="#0d9488" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="24" cy="6.5" r="4" fill="#0d9488"/>
  <path d="M17 26 L31 26" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>
  <path d="M17 32 L28 32" stroke="#10b981" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M17 38 L25 38" stroke="#0d9488" stroke-width="2.6" stroke-linecap="round"/>
</svg>`;