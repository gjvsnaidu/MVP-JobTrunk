import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyPortfolio, useCreatePortfolioItem, useDeletePortfolioItem } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ExternalLink, CheckCircle2, Award, Briefcase, GraduationCap, Star } from "lucide-react";

const ITEM_TYPES = [
  { value: "certification", label: "Certification", icon: Award },
  { value: "project", label: "Project", icon: Star },
  { value: "internship", label: "Internship", icon: Briefcase },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "achievement", label: "Achievement", icon: CheckCircle2 },
];

export default function Portfolio() {
  const { data: items, isLoading } = useMyPortfolio();
  const createMutation = useCreatePortfolioItem();
  const deleteMutation = useDeletePortfolioItem();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "certification",
    title: "",
    description: "",
    url: "",
    issuedBy: "",
  });

  const portfolio = Array.isArray(items) ? items : [];

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Portfolio item added!");
      setShowForm(false);
      setFormData({ type: "certification", title: "", description: "", url: "", issuedBy: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add item");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Item removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Portfolio</h1>
            <p className="text-muted-foreground">Showcase your skills, certifications, projects, and achievements.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Portfolio Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
              <Input
                placeholder="URL (optional)"
                value={formData.url}
                onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
              />
              <Input
                placeholder="Issued by (optional)"
                value={formData.issuedBy}
                onChange={(e) => setFormData((p) => ({ ...p, issuedBy: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Items */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : portfolio.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Your portfolio is empty. Add your first item!</p>
              <Button onClick={() => setShowForm(true)}>Add First Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {portfolio.map((item: any) => {
              const TypeIcon = ITEM_TYPES.find((t) => t.value === item.type)?.icon ?? Star;
              return (
                <Card key={item.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          )}
                          {item.issuedBy && (
                            <p className="text-xs text-muted-foreground mt-2">Issued by: {item.issuedBy}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {item.verified && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
