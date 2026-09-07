import DashboardLayout from "@/components/DashboardLayout";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { useInternships, useRecommendedInternships } from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";

export default function Internships() {
  const { isStudent } = useRole();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { data: allInternships, isLoading } = useInternships({ search, type: typeFilter !== "all" ? typeFilter : undefined });
  const { data: recommended, isLoading: recLoading } = useRecommendedInternships();

  const internships = Array.isArray(allInternships) ? allInternships : (allInternships as any)?.items ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Internships</h1>
          <p className="text-muted-foreground">Browse and apply to internship opportunities.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search internships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue={isStudent ? "recommended" : "all"}>
          {isStudent && (
            <TabsList>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="all">All Internships</TabsTrigger>
            </TabsList>
          )}

          {isStudent && (
            <TabsContent value="recommended" className="space-y-4">
              {recLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : Array.isArray(recommended) && recommended.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {recommended.slice(0, 8).map((item: any) => (
                    <OpportunityCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      location={item.location}
                      duration={item.duration}
                      stipend={item.stipend}
                      type={item.type}
                      matchScore={item.matchScore}
                      onView={() => window.location.href = `/opportunities/internships/${item.id}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Complete your skill assessment to see matched internships.
                </p>
              )}
            </TabsContent>
          )}

          <TabsContent value={isStudent ? "all" : "all"} className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : internships.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {internships.map((item: any) => (
                  <OpportunityCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    location={item.location}
                    duration={item.duration}
                    stipend={item.stipend}
                    type={item.type}
                    status={item.status}
                    onView={() => window.location.href = `/opportunities/internships/${item.id}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No internships found.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
