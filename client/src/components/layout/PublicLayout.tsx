import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { startLogin } from "@/const";
import { JobTrunkLogo } from "@/components/brand/JobTrunkLogo";

const oauthAvailable = Boolean((import.meta.env.VITE_OAUTH_PORTAL_URL as string) ?? "");

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useMe();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <JobTrunkLogo variant="full" className="text-lg" />
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link href={ROUTES.DASHBOARD}>
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                {oauthAvailable && (
                  <Button variant="outline" onClick={() => startLogin()}>
                    Sign In
                  </Button>
                )}
                <Link href={ROUTES.DASHBOARD}>
                  <Button>Enter Student Demo</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <JobTrunkLogo variant="full" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your Career. One Trunk. — Skills · Learning · Internships · Jobs · Placements
            </p>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} JobTrunk</p>
          </div>
        </div>
      </footer>
    </div>
  );
}