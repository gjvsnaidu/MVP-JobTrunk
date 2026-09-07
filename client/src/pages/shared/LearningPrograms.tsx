import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLearningPrograms } from "@/lib/api";
import { Link } from "wouter";
import { Loader2, GraduationCap, Clock, Users } from "lucide-react";

export default function LearningPrograms() {
  const { data: programs, isLoading } = useLearningPrograms();
  const items = Array.isArray(programs) ? programs : (programs as any)?.items ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Learning Programs</h1>
          <p className="text-muted-foreground">Browse certification courses, workshops, and mentorship programs.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No learning programs available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((program: any) => (
              <Card key={program.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">{program.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{program.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {program.duration && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {program.duration}</span>
                    )}
                    {program.enrolledCount !== undefined && (
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {program.enrolledCount} enrolled</span>
                    )}
                    {program.fee && <span>{program.fee}</span>}
                  </div>
                  <Link href={`/learning/${program.id}`}>
                    <Button size="sm" className="w-full">View Program</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
