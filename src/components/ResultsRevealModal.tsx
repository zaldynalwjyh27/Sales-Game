'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { JISR_EVALUATION_CRITERIA } from '@/lib/jisr-constants';
import { closeRoomForEveryone } from '@/server/actions';
import { useState } from 'react';
import { LeaderboardAndResults } from './LeaderboardAndResults';
import { useRouter } from 'next/navigation';
import { Trophy, History, LogOut, RotateCcw, Star, Quote } from 'lucide-react';

interface Evaluation {
  id: string;
  evaluator: {
    name: string;
  };
  target?: {
    name: string;
  };
  scores: string;
  notes?: string;
  targetId: string;
  roundNumber: number;
}

interface ResultsRevealProps {
  evaluations: Evaluation[];
  isHost: boolean;
  roomId: string;
  players: any[];
  currentRound: number;
}

export function ResultsRevealModal({ evaluations, isHost, roomId, players, currentRound }: ResultsRevealProps) {
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  if (evaluations.length === 0) return null;

  const parsedEvals = evaluations.map((e) => ({
    id: e.id,
    evaluatorName: e.evaluator?.name || 'مقيّم غير معروف',
    targetName: e.target?.name || 'لاعب غير معروف',
    roundNumber: e.roundNumber,
    scores: JSON.parse(e.scores) as Record<number, number>,
    notes: e.notes,
  }));

  const rounds = Array.from(new Set(parsedEvals.map(e => e.roundNumber))).sort((a, b) => a - b);

  const handleCloseRoom = async () => {
    try {
      await closeRoomForEveryone(roomId);
    } catch (e) {
      router.push('/');
    }
  };

  return (
    <div className="space-y-12 pb-20" dir="rtl">
      {/* 🏆 Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">النتائج النهائية</h2>
        </div>
        <LeaderboardAndResults 
          roomId={roomId} 
          evaluations={evaluations} 
          players={players} 
          currentRound={currentRound} 
        />
      </div>

      <Separator className="my-8" />

      {/* 📋 Detailed Results per Round */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 justify-center">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-bold">سجل تقييم الجولات</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {rounds.map(roundNum => (
            <Card key={roundNum} className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background">الجولة {roundNum}</Badge>
                  <span className="text-xs text-muted-foreground">تفاصيل التقييمات الفردية</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right border-collapse">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-bold text-muted-foreground min-w-[200px]">المعيار</th>
                        {parsedEvals.filter(e => e.roundNumber === roundNum).map((ev, i) => (
                          <th key={i} className="px-4 py-3 text-center border-r">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-primary">{ev.evaluatorName}</span>
                              <span className="text-[10px] text-muted-foreground">يُقيّم</span>
                              <span className="font-medium">{ev.targetName}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {JISR_EVALUATION_CRITERIA.map((criterion, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4 font-medium">{criterion}</td>
                          {parsedEvals.filter(e => e.roundNumber === roundNum).map((ev, i) => (
                            <td key={i} className="px-4 py-4 text-center border-r">
                              <div className="flex justify-center items-center gap-1">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star 
                                    key={starIndex} 
                                    className={`h-3 w-3 ${starIndex < (ev.scores[idx] || 0) ? 'fill-primary text-primary' : 'text-muted/30'}`}
                                  />
                                ))}
                                <span className="mr-1.5 font-bold text-xs">({ev.scores[idx] || 0})</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Round Notes */}
                <div className="p-6 bg-muted/10 border-t space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Quote className="h-4 w-4 text-muted-foreground" />
                    ملاحظات المقيمين:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedEvals.filter(e => e.roundNumber === roundNum && e.notes).map((ev, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-background border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {ev.evaluatorName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold">{ev.evaluatorName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">"{ev.notes}"</p>
                      </div>
                    ))}
                    {parsedEvals.filter(e => e.roundNumber === roundNum && e.notes).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">لا توجد ملاحظات لهذه الجولة.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Button 
            onClick={() => window.location.reload()} 
            className="h-12 px-8 gap-2 font-bold shadow-lg shadow-primary/20"
          >
            <RotateCcw className="h-5 w-5" />
            بدء جلسة تدريبية جديدة
          </Button>

          <Button 
            onClick={handleCloseRoom} 
            variant="outline"
            className="h-12 px-8 gap-2 font-bold"
          >
            <LogOut className="h-5 w-5" />
            إنهاء الجلسة للجميع
          </Button>
        </div>
      )}
    </div>
  );
}