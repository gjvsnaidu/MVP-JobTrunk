import DashboardLayout from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, Handshake, ArrowRight } from "lucide-react";

export default function AcademicianDashboard() {
  const { user } = useRole() as any;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Academician Dashboard</h1>
          <p className="text-muted-foreground">Explore faculty opportunities and industry collaborations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Faculty Opportunities" value={0} icon={BookOpen} description="FDPs, consultancy, research" />
          <StatsCard title="Active Collaborations" value={0} icon={Handshake} description="With industry partners" />
          <StatsCard title="Applications" value={0} icon={BookOpen} description="Pending responses" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/faculty-opportunities">
                <Button className="w-full justify-between">
                  Browse Faculty Opportunities <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/collaborations">
                <Button variant="outline" className="w-full justify-between">
                  View Collaborations <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
