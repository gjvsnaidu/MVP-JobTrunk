import { useRole } from "@/hooks/useRole";
import { UserRole } from "@shared/const";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type RoleGuardProps = {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
};

export default function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { role, isLoading, isAuthenticated } = useRole() as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Please sign in to access this page.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      )
    );
  }

  if (roles && role && !roles.includes(role)) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      )
    );
  }

  return <>{children}</>;
}
