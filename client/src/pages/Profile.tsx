import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMyProfile, useUpdateProfile } from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function Profile() {
  const { role } = useRole() as any;
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: (profile as any).name ?? "",
        phone: (profile as any).phone ?? "",
        // Industry
        companyName: (profile as any).industryProfile?.companyName ?? "",
        industry: (profile as any).industryProfile?.industry ?? "",
        website: (profile as any).industryProfile?.website ?? "",
        description: (profile as any).industryProfile?.description ?? "",
        location: (profile as any).industryProfile?.location ?? "",
        // Academician
        department: (profile as any).academicianProfile?.department ?? "",
        designation: (profile as any).academicianProfile?.designation ?? "",
        bio: (profile as any).academicianProfile?.bio ?? "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name ?? ""} onChange={(e) => updateField("name", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={formData.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Industry Profile */}
        {role === "industry" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input value={formData.companyName ?? ""} onChange={(e) => updateField("companyName", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input value={formData.industry ?? ""} onChange={(e) => updateField("industry", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input value={formData.website ?? ""} onChange={(e) => updateField("website", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={formData.location ?? ""} onChange={(e) => updateField("location", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={formData.description ?? ""} onChange={(e) => updateField("description", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academician Profile */}
        {role === "academician" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input value={formData.department ?? ""} onChange={(e) => updateField("department", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Designation</label>
                <Input value={formData.designation ?? ""} onChange={(e) => updateField("designation", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea value={formData.bio ?? ""} onChange={(e) => updateField("bio", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Profile
        </Button>
      </div>
    </DashboardLayout>
  );
}
