'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { JISR_EVALUATION_CRITERIA } from '@/lib/jisr-constants';

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
  scores: string; // JSON string of scores
  notes?: string;
}

interface LeaderboardAndResultsProps {
  roomId: string;
  evaluations: Evaluation[];
  players: any[]; // Player data from the room
  currentRound: number;
}

export function LeaderboardAndResults({ 
  roomId, 
  evaluations, 
  players, 
  currentRound 
}: LeaderboardAndResultsProps) {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'evaluations'>('leaderboard');
  
  useEffect(() => {
    // Process evaluations to calculate player scores
    const scoreMap: Record<string, { total: number, count: number, playerName: string }> = {};
    
    evaluations.forEach(evaluation => {
      const scoresObj = JSON.parse(evaluation.scores) as Record<number, number>;
      const totalScore = Object.values(scoresObj).reduce((sum, score) => sum + score, 0);
      
      // Find the target player from the room
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
    
    // Sort by average score descending
    calculatedScores.sort((a, b) => b.averageScore - a.averageScore);
    
    setPlayerScores(calculatedScores);
  }, [evaluations, players]);

  return (
    <div className="w-full space-y-6">
      <Card className="bg-white/[0.04] backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-l from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            لوحة النتائج وتصنيف الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex border-b border-slate-700 mb-4">
            <Button
              variant="ghost"
              className={`mr-2 ${activeTab === 'leaderboard' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              لائحة المتصدرين
            </Button>
            <Button
              variant="ghost"
              className={`${activeTab === 'evaluations' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
              onClick={() => setActiveTab('evaluations')}
            >
              تفاصيل التقييمات
            </Button>
          </div>
          
          {activeTab === 'leaderboard' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">أداء البائعين عبر الجولات ({currentRound})</h3>
              
              {playerScores.length > 0 ? (
                <ScrollArea className="h-[450px] pr-2">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="py-3 px-3 text-slate-300 font-bold">#</th>
                          <th className="py-3 px-3 text-slate-300 font-bold">الاسم</th>
                          <th className="py-3 px-3 text-slate-300 font-bold text-center">الجولات</th>
                          <th className="py-3 px-3 text-slate-300 font-bold text-center">المجموع</th>
                          <th className="py-3 px-3 text-slate-300 font-bold text-center">المعدل النهائي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerScores.map((player, index) => (
                          <tr key={player.playerId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 px-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                index === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/30' :
                                'bg-slate-700/50 text-slate-300'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 px-3 font-bold text-lg">{player.playerName}</td>
                            <td className="py-4 px-3 text-slate-300 text-center font-mono">{player.roundCount}</td>
                            <td className="py-4 px-3 text-slate-300 text-center font-mono">{player.totalScore.toFixed(1)}</td>
                            <td className="py-4 px-3">
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-black text-2xl text-blue-400">{player.averageScore.toFixed(2)}</span>
                                <div className="flex mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span 
                                      key={i} 
                                      className={`text-sm ${i < Math.floor(player.averageScore) ? 'text-yellow-400' : 'text-slate-700'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 pb-4">
                    {playerScores.map((player, index) => (
                      <div key={player.playerId} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-1 h-full ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                          'bg-slate-600'
                        }`} />
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {index + 1}
                            </span>
                            <h4 className="font-bold text-lg">{player.playerName}</h4>
                          </div>
                          <div className="text-left">
                            <div className="text-2xl font-black text-blue-400 leading-none">
                              {player.averageScore.toFixed(2)}
                            </div>
                            <div className="flex justify-end mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-[10px] ${i < Math.floor(player.averageScore) ? 'text-yellow-400' : 'text-slate-700'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700/50 pt-3">
                          <div className="text-slate-400">
                            عدد الجولات: <span className="text-slate-200 font-bold">{player.roundCount}</span>
                          </div>
                          <div className="text-slate-400 text-left">
                            إجمالي النقاط: <span className="text-slate-200 font-bold">{player.totalScore.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-slate-500 italic bg-slate-800/20 rounded-xl">
                  لا توجد بيانات تقييمية متاحة حالياً
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">تفاصيل التقييمات</h3>
              
              {evaluations.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {evaluations.map((evaluation, index) => {
                      const scores = JSON.parse(evaluation.scores) as Record<number, number>;
                      const targetPlayer = players.find((p: any) => p.id === evaluation.targetId);
                      
                      return (
                        <Card key={evaluation.id} className="bg-slate-800/50 border-slate-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base text-slate-200">
                              تقييم من <span className="text-cyan-400">{evaluation.evaluator.name}</span> لـ <span className="text-green-400">{targetPlayer?.name || 'البائع'}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-3 mb-4">
                              {JISR_EVALUATION_CRITERIA.map((criterion, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                                  <span className="text-slate-300 text-sm">{criterion}</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, starIdx) => (
                                      <span 
                                        key={starIdx} 
                                        className={`text-lg ${starIdx < (scores[idx] || 0) ? 'text-yellow-400' : 'text-slate-700'}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {evaluation.notes && (
                              <div className="pt-3 border-t border-slate-700">
                                <p className="text-slate-400 text-sm"><strong className="text-slate-300">ملاحظات:</strong> {evaluation.notes}</p>
                              </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between">
                              <span className="text-slate-400 text-sm">
                                المجموع: <span className="font-bold text-yellow-400">
                                  {Object.values(scores).reduce((sum, score) => sum + score, 0)} / 25
                                </span>
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  لا توجد تقييمات بعد
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}