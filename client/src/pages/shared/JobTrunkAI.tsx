import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { useAskAI, useStudentReadiness, useGapAnalysisQuery } from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { Sparkles, Loader2, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const SUGGESTIONS = [
  "What career suits my skills?",
  "What should I learn next?",
  "Find internships for me.",
  "Which jobs match my profile?",
  "How can I improve my career readiness?",
  "What skills do I need to become a Data Analyst?",
];

export default function JobTrunkAI() {
  const { role } = useRole() as any;
  const [messages, setMessages] = useState<Message[]>([]);
  const askMutation = useAskAI();
  const { data: readiness } = useStudentReadiness();
  const { data: gapData } = useGapAnalysisQuery();

  const isStudent = role === "student";
  const gaps = (gapData as any)?.gaps ?? [];
  const biggestGap = gaps.find((g: any) => g.currentScore > 0) ?? gaps[0];

  const handleSend = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    askMutation.mutate(
      content,
      {
        onSuccess: (res: any) => {
          setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
        },
        onError: (e: any) => {
          setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I hit an error: ${e.message || "please try again"}` }]);
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> JobTrunk AI
            </h1>
            <p className="text-muted-foreground">Your Personal Career Copilot — answers come from your real skills, gaps and matches.</p>
          </div>
        </div>

        {/* Snapshot strip */}
        {isStudent && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Career Readiness</p>
                  {readiness ? (
                    <p className="font-bold text-lg">{readiness.score}/100 <span className="text-xs font-normal text-muted-foreground">{readiness.category}</span></p>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Biggest Skill Gap</p>
                  {biggestGap ? (
                    <p className="font-bold text-lg">{biggestGap.skillName} <span className="text-xs font-normal text-muted-foreground">gap {biggestGap.gapPercent}%</span></p>
                  ) : (
                    <p className="text-sm text-muted-foreground">None — great!</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground w-full">Try asking:</p>
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline" className="text-xs cursor-pointer hover:bg-accent" onClick={() => handleSend(s)}>
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <AIChatBox
          messages={messages}
          onSendMessage={handleSend}
          isLoading={askMutation.isPending}
          placeholder="Ask about your career, skills, gaps or next steps..."
          height={560}
          emptyStateMessage={
            isStudent
              ? "Hi Arjun — I'm your JobTrunk career copilot. Ask me anything about your skills, gaps or next career move."
              : "Sign in with a demo account to get personalized career answers."
          }
          suggestedPrompts={isStudent ? SUGGESTIONS : undefined}
        />

        <p className="text-xs text-muted-foreground text-center">
          JobTrunk AI is a demo copilot. Responses are generated from your live profile data — skills, assessments, gaps and matches — and architected for a real LLM API later.
        </p>
      </div>
    </DashboardLayout>
  );
}