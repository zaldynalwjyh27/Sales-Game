'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { submitEvaluation } from '@/server/actions';
import { JISR_EVALUATION_CRITERIA } from '@/lib/jisr-constants';
import { ClipboardCheck, Star, MessageSquare, Send } from 'lucide-react';

interface HiddenEvaluatorFormProps {
  roomId: string;
  evaluatorId: string;
  targetId: string | null;
  targetName: string | null;
  hasSubmitted: boolean;
}

export function HiddenEvaluatorForm({ roomId, evaluatorId, targetId, targetName, hasSubmitted }: HiddenEvaluatorFormProps) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(hasSubmitted);

  if (!targetId) {
    return (
      <Card className="w-full border-dashed shadow-none bg-muted/20" dir="rtl">
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <ClipboardCheck className="h-6 w-6 opacity-20" />
          </div>
          <p className="text-sm italic">في انتظار انضمام البائع للبدء بالتقييم.</p>
        </CardContent>
      </Card>
    );
  }

  const handleScoreChange = (index: number, score: number) => {
    setScores((prev) => ({ ...prev, [index]: score }));
  };

  const handleSubmit = async () => {
    if (Object.keys(scores).length < JISR_EVALUATION_CRITERIA.length) {
      alert("الرجاء تقييم جميع المعايير");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitEvaluation(roomId, evaluatorId, targetId, scores, notes);
      setSubmitted(true);
    } catch (err) {
      alert("حدث خطأ أثناء الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border shadow-lg overflow-hidden" dir="rtl">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            نموذج التقييم
          </Badge>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 uppercase">مباشر</span>
          </div>
        </div>
        <CardTitle className="text-lg">تقييم أداء البائع</CardTitle>
        <CardDescription>
          أنت تقوم بتقييم المشارك: <span className="font-bold text-foreground">{targetName}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {submitted ? (
          <div className="py-12 px-6 text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">تم إرسال التقييم!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px] mx-auto">
              شكراً لك. سيتم كشف النتائج للجميع من قبل المنظم بعد انتهاء الجولة.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-6">
              {JISR_EVALUATION_CRITERIA.map((criterion, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">{criterion}</Label>
                    {scores[index] && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {scores[index]} / 5
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between gap-2" dir="ltr">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant={scores[index] === star ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleScoreChange(index, star)}
                        className={`flex-1 h-10 font-bold transition-all ${
                          scores[index] === star 
                            ? 'bg-purple-600 hover:bg-purple-700 shadow-md ring-2 ring-purple-500/20 ring-offset-1' 
                            : 'hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        {star}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                ملاحظات إضافية
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اذكر نقاط القوة والضعف..."
                className="min-h-[100px] resize-none focus-visible:ring-purple-500"
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {!submitted && (
        <CardFooter className="bg-muted/20 border-t p-4">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || Object.keys(scores).length < JISR_EVALUATION_CRITERIA.length}
            className="w-full h-11 bg-purple-600 hover:bg-purple-700 gap-2 font-bold shadow-lg shadow-purple-500/20"
          >
            {isSubmitting ? 'جاري الإرسال...' : (
              <>
                <Send className="h-4 w-4" />
                إرسال التقييم النهائي
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}