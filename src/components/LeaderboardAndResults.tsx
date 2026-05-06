'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JISR_EVALUATION_CRITERIA } from '@/lib/jisr-constants';
import { Trophy, ListChecks, Star, User, Hash, Award } from 'lucide-react';

interface PlayerScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  roundCount: number;
  averageScore: number;
}

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

interface LeaderboardAndResultsProps {
  roomId: string;
  evaluations: Evaluation[];
  players: any[];
  currentRound: number;
}

export function LeaderboardAndResults({ 
  roomId, 
  evaluations, 
  players, 
  currentRound 
}: LeaderboardAndResultsProps) {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  
  useEffect(() => {
    const scoreMap: Record<string, { total: number, count: number, playerName: string }> = {};
    
    evaluations.forEach(evaluation => {
      const scoresObj = JSON.parse(evaluation.scores) as Record<number, number>;
      const totalScore = Object.values(scoresObj).reduce((sum, score) => sum + score, 0);
      
      const targetPlayer = players.find(p => p.id === evaluation.targetId);
      if (targetPlayer) {
        if (!scoreMap[targetPlayer.id]) {
          scoreMap[targetPlayer.id] = {
            total: 0,
            count: 0,
            playerName: targetPlayer.name
          };
        }
        scoreMap[targetPlayer.id].total += totalScore;
        scoreMap[targetPlayer.id].count += 1;
      }
    });
    
    const calculatedScores: PlayerScore[] = Object.entries(scoreMap).map(([playerId, data]) => ({
      playerId,
      playerName: data.playerName,
      totalScore: data.total,
      roundCount: data.count,
      averageScore: parseFloat((data.total / data.count).toFixed(2))
    }));
    
    calculatedScores.sort((a, b) => b.averageScore - a.averageScore);
    setPlayerScores(calculatedScores);
  }, [evaluations, players]);

  return (
    <div className="w-full space-y-6" dir="rtl">
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mx-auto mb-8">
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            المتصدرون
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="gap-2">
            <ListChecks className="h-4 w-4" />
            التفاصيل
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaderboard">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                تصنيف أداء المشاركين
              </CardTitle>
              <CardDescription>بناءً على متوسط التقييمات عبر الجولات الماضية.</CardDescription>
            </CardHeader>
            <CardContent>
              {playerScores.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-hidden rounded-lg border">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="py-3 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider"><Hash className="h-3 w-3 inline mr-1" /> المركز</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider"><User className="h-3 w-3 inline mr-1" /> الاسم</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider text-center">الجولات</th>
                          <th className="py-3 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider text-center">المعدل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {playerScores.map((player, index) => (
                          <tr key={player.playerId} className="hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-4">
                              {index === 0 ? (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-7 w-7 rounded-full p-0 flex items-center justify-center">1</Badge>
                              ) : index === 1 ? (
                                <Badge className="bg-slate-400 hover:bg-slate-500 text-white font-bold h-7 w-7 rounded-full p-0 flex items-center justify-center">2</Badge>
                              ) : index === 2 ? (
                                <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-7 w-7 rounded-full p-0 flex items-center justify-center">3</Badge>
                              ) : (
                                <span className="text-muted-foreground font-bold mr-2">{index + 1}</span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-bold">{player.playerName}</td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant="outline" className="font-mono">{player.roundCount}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-primary">{player.averageScore.toFixed(2)}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-2.5 w-2.5 ${i < Math.floor(player.averageScore) ? 'fill-primary text-primary' : 'text-muted'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {playerScores.map((player, index) => (
                      <div key={player.playerId} className="p-4 rounded-xl border bg-muted/20 relative group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-slate-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </span>
                            <h4 className="font-bold">{player.playerName}</h4>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-black text-primary">{player.averageScore.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                          <span>الجولات: {player.roundCount}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-2 w-2 ${i < Math.floor(player.averageScore) ? 'fill-primary text-primary' : 'text-muted'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed">
                  بانتظار نتائج الجولات...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluations">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <div className="space-y-6">
              {evaluations.length > 0 ? (
                evaluations.map((evaluation) => {
                  const scores = JSON.parse(evaluation.scores) as Record<number, number>;
                  const targetPlayer = players.find((p: any) => p.id === evaluation.targetId);
                  
                  return (
                    <Card key={evaluation.id} className="border shadow-none bg-muted/20 overflow-hidden">
                      <CardHeader className="py-3 px-4 border-b bg-muted/30">
                        <CardTitle className="text-sm">
                          تقييم <span className="text-primary font-bold">{evaluation.evaluator.name}</span> لـ <span className="font-bold">{targetPlayer?.name || 'لاعب'}</span>
                        </CardTitle>
                        <CardDescription className="text-[10px]">الجولة {evaluation.roundNumber}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {JISR_EVALUATION_CRITERIA.map((criterion, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-background border rounded-lg text-[10px]">
                              <span className="font-medium">{criterion}</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-primary">{scores[idx] || 0}</span>
                                <Star className="h-2 w-2 fill-primary text-primary" />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {evaluation.notes && (
                          <div className="p-3 rounded-lg bg-background border border-dashed text-xs italic text-muted-foreground">
                            "{evaluation.notes}"
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Badge variant="secondary">
                            المجموع: {Object.values(scores).reduce((sum, score) => sum + score, 0)} / 25
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="py-20 text-center text-muted-foreground italic">لا توجد تقييمات مفصلة بعد.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}