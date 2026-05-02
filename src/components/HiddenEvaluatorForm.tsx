'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { submitEvaluation, updatePartialEvaluation } from '@/server/actions';
import { JISR_EVALUATION_CRITERIA } from '@/lib/jisr-constants';

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
      <Card className="w-full bg-slate-50 dark:bg-slate-900 rtl">
        <CardContent className="p-6 text-center text-slate-500">
          في انتظار انضمام البائع للبدء بالتقييم.
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
      console.error(err);
      alert("حدث خطأ أثناء الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full rtl shadow-lg border-t-4 border-t-purple-600 bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
          📋 نموذج التقييم المباشر
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">تقييم أداء البائع: <span className="font-semibold text-slate-700 dark:text-slate-200">{targetName}</span></p>
      </CardHeader>
      
      <CardContent className="pt-2">
        {submitted ? (
          <div className="py-8 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-center border border-green-100 dark:border-green-900 animate-in fade-in zoom-in duration-300">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold mb-1">تم إرسال التقييم بنجاح</h3>
            <p className="text-sm opacity-80">سيتم كشف النتائج للجميع من قبل المنظم لاحقاً.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {JISR_EVALUATION_CRITERIA.map((criterion, index) => (
                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-all hover:border-purple-200 dark:hover:border-purple-900">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">{criterion}</h3>
                  <div className="flex flex-wrap gap-2" dir="ltr">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleScoreChange(index, star)}
                        className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center border-2 font-bold ${
                          scores[index] === star 
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-800'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label htmlFor="notes" className="block mb-2 font-bold text-slate-700 dark:text-slate-100">
                ملاحظات إضافية (اختياري)
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اذكر ملاحظاتك حول نقاط القوة والضعف..."
                className="min-h-[100px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 rounded-xl"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || Object.keys(scores).length < JISR_EVALUATION_CRITERIA.length}
              className="w-full h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-xl shadow-purple-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم النهائي'}
            </Button>
            
            <p className="text-xs text-slate-500 text-center">
              التقييم سري ومباشر - الحد الأقصى 25 نقطة
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}