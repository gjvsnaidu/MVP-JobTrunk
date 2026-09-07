import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAssessments, useAssessment, useSubmitAssessment } from "@/lib/api";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

export default function SkillAssessment() {
  const [, setLocation] = useLocation();
  const { data: assessments, isLoading: listLoading } = useAssessments();
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const { data: assessment, isLoading: detailLoading } = useAssessment(selectedAssessment ?? 0);
  const submitMutation = useSubmitAssessment();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [startTime] = useState(Date.now());

  const questions = (assessment as any)?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStep];
  const progress = totalQuestions > 0 ? ((currentStep + 1) / totalQuestions) * 100 : 0;

  // Auto-select first assessment
  useEffect(() => {
    if (Array.isArray(assessments) && assessments.length > 0 && !selectedAssessment) {
      setSelectedAssessment(assessments[0].id);
    }
  }, [assessments, selectedAssessment]);

  const handleAnswer = (value: string | number) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer,
      }));

      const result = await submitMutation.mutateAsync({
        id: selectedAssessment,
        data: {
          answers: answerArray,
          durationSeconds: Math.round((Date.now() - startTime) / 1000),
        },
      });

      toast.success("Assessment completed! Redirecting to results...");
      setTimeout(() => setLocation(ROUTES.SKILLS_RESULTS), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit assessment");
    }
  };

  if (listLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // No assessment selected yet or showing assessment list
  if (!selectedAssessment || (assessment as any)?.questions?.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">Skill Assessment</h1>
          <p className="text-muted-foreground">
            Complete an assessment to evaluate your skills and generate your skill profile.
          </p>

          {detailLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : Array.isArray(assessments) && assessments.length > 0 ? (
            <div className="grid gap-4">
              {assessments.map((a: any) => (
                <Card key={a.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedAssessment(a.id)}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{a.totalQuestions} questions</span>
                      {a.timeLimitMinutes && <span>{a.timeLimitMinutes} min</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No assessments available yet.</p>
                <Link href={ROUTES.DASHBOARD}>
                  <Button variant="outline" className="mt-4">Back to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Assessment in progress
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{(assessment as any)?.title}</h1>
          <span className="text-sm text-muted-foreground">
            Question {currentStep + 1} of {totalQuestions}
          </span>
        </div>

        <Progress value={progress} className="h-2" />

        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.questionType === "mcq" && currentQuestion.options ? (
                <RadioGroup
                  value={String(answers[currentQuestion.id] ?? "")}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map(
                    (option: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={option} id={`q-${currentQuestion.id}-${idx}`} />
                        <Label htmlFor={`q-${currentQuestion.id}-${idx}`} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              ) : currentQuestion.questionType === "confidence" || currentQuestion.questionType === "rating" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Rate your confidence/skill level (1-5)</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Button
                        key={val}
                        variant={answers[currentQuestion.id] === val ? "default" : "outline"}
                        size="lg"
                        className="w-16 h-16 text-lg"
                        onClick={() => handleAnswer(val)}
                      >
                        {val}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Question type not supported.</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>

          {currentStep === totalQuestions - 1 ? (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="gap-2">
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!answers[currentQuestion?.id]} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
