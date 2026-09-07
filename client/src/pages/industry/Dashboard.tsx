import DashboardLayout from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, GraduationCap, PlusCircle } from "lucide-react";

export default function IndustryDashboard() {
  const { user } = useRole() as any;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Industry Dashboard</h1>
          <p className="text-muted-foreground">Manage your opportunities and find the best candidates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Posted Internships" value={0} icon={Briefcase} description="Active listings" />
          <StatsCard title="Posted Jobs" value={0} icon={Briefcase} description="Active listings" />
          <StatsCard title="Total Applicants" value={0} icon={Users} description="Across all listings" />
          <StatsCard title="Learning Programs" value={0} icon={GraduationCap} description="Published programs" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/opportunities/new">
                <Button className="w-full justify-start gap-2"><PlusCircle className="h-4 w-4" /> Post Internship</Button>
              </Link>
              <Link href="/opportunities/new">
                <Button variant="outline" className="w-full justify-start gap-2"><PlusCircle className="h-4 w-4" /> Post Job</Button>
              </Link>
              <Link href="/learning/new">
                <Button variant="outline" className="w-full justify-start gap-2"><GraduationCap className="h-4 w-4" /> Create Learning Program</Button>
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
