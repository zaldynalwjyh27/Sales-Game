'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JISR_EVALUATION_CRITERIA } from '@/lib/jisr-constants';
import { nextRound, closeRoomForEveryone } from '@/server/actions';
import { useState } from 'react';
import { LeaderboardAndResults } from './LeaderboardAndResults';
import { useRouter } from 'next/navigation';

interface Evaluation {
  id: string;
  evaluator: {
    name: string;
  };
  target?: {
    name: string;
  };
  scores: string; // JSON string of scores
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

  // Group evaluations by round
  const rounds = Array.from(new Set(parsedEvals.map(e => e.roundNumber))).sort((a, b) => a - b);

  const handleCloseRoom = async () => {
    try {
      await closeRoomForEveryone(roomId);
    } catch (e) {
      console.error(e);
      router.push('/');
    }
  };

  return (
    <div className="space-y-8">
      {/* 🏆 Leaderboard Section (Cumulative) */}
      <LeaderboardAndResults 
        roomId={roomId} 
        evaluations={evaluations} 
        players={players} 
        currentRound={currentRound} 
      />

      {/* 📋 Detailed Results per Round */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center mb-4">تفاصيل تقييمات الجولات</h2>
        
        {rounds.map(roundNum => (
          <Card key={roundNum} className="w-full bg-slate-900 text-white rtl overflow-hidden shadow-xl border-slate-700">
            <CardHeader className="bg-slate-800 border-b border-slate-700">
              <CardTitle className="text-xl font-bold text-yellow-400">
                الجولة {roundNum}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
                <div className="min-w-[600px] md:min-w-full">
                  <table className="w-full text-[10px] sm:text-xs text-right border-collapse">
                    <thead className="bg-slate-800/80 text-slate-300">
                      <tr>
                        <th className="px-3 py-3 border-b border-slate-700 font-bold sticky right-0 bg-slate-800 z-10 min-w-[120px]">المعيار</th>
                        {parsedEvals.filter(e => e.roundNumber === roundNum).map((ev, i) => (
                          <th key={i} className="px-3 py-3 border-b border-slate-700 text-center font-bold">
                            <div className="flex flex-col items-center">
                              <span className="text-cyan-400">{ev.evaluatorName}</span>
                              <span className="text-[8px] text-slate-500">←</span>
                              <span className="text-green-400">{ev.targetName}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {JISR_EVALUATION_CRITERIA.map((criterion, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 py-3 font-medium text-slate-200 sticky right-0 bg-slate-900/90 backdrop-blur-sm z-10 border-l border-slate-800/50">{criterion}</td>
                          {parsedEvals.filter(e => e.roundNumber === roundNum).map((ev, i) => (
                            <td key={i} className="px-3 py-3 text-center">
                              <div className="flex justify-center items-center gap-0.5">
                                {[...Array(5)].map((_, starIndex) => (
                                  <span 
                                    key={starIndex} 
                                    className={`text-[10px] sm:text-sm ${starIndex < (ev.scores[idx] || 0) ? 'text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.4)]' : 'text-slate-700'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="mr-1 font-mono text-[10px] text-slate-500">({ev.scores[idx] || 0})</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Round Notes */}
              {parsedEvals.filter(e => e.roundNumber === roundNum && e.notes).length > 0 && (
                <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">ملاحظات الجولة {roundNum}:</h4>
                  <div className="space-y-2">
                    {parsedEvals.filter(e => e.roundNumber === roundNum && e.notes).map((ev, idx) => (
                      <div key={idx} className="text-xs text-slate-300 border-r-2 border-cyan-500 pr-2">
                        <span className="font-bold text-cyan-400">{ev.evaluatorName}:</span> {ev.notes}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isHost && (
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg transition-all"
          >
            🔄 بدء جلسة تدريبية جديدة
          </Button>

          <Button 
            onClick={handleCloseRoom} 
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 font-bold px-8 py-4 text-lg rounded-xl transition-all"
          >
            🏠 إنهاء الجلسة للجميع والعودة للرئيسية
          </Button>
        </div>
      )}
    </div>
  );
}