'use client';

import { Player } from '@/lib/jisr-constants';

interface PlayerRoleDisplayProps {
  player: Player;
  isCurrentUser?: boolean;
}

export function PlayerRoleDisplay({ player, isCurrentUser = false }: PlayerRoleDisplayProps) {
  return (
    <>
      {player.role && (
        <div className="mt-2 text-xs text-slate-400">
          {player.role === 'SELLER' && '• Role: بائع'}
          {player.role === 'CLIENT' && '• Role: عميل'}
          {player.role === 'EVALUATOR' && '• Role: مُقيّم'}
        </div>
      )}
      
      {isCurrentUser && (
        <span className="text-xs text-blue-400">(أنت)</span>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { assignRandomRoles, updateRoomSettings, removePlayer, updatePlayerName, revealEvaluations, resetRoomToLobby, closeRoomForEveryone } from '@/server/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RoleCardDisplay } from '@/components/RoleCardDisplay';
import { HiddenEvaluatorForm } from '@/components/HiddenEvaluatorForm';
import { ResultsRevealModal } from '@/components/ResultsRevealModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QUESTION_COUNTS, QUESTION_TYPES } from '@/lib/jisr-constants';

interface Player {
  id: string;
  name: string;
  role: string | null;
  isHost: boolean;
  isLocked: boolean; // Added for preventing name changes after session starts
  roomId: string;
}

interface RoomData {
  id: string;
  status: string;
  currentRound: number;
  scenarioId: number | null;
  questionCount: number; // Added for question bank feature
  questionType: string; // Added for question type selection
  players: Player[];
  evaluations: any[];
}

export function RoomClient({
  room: initialRoom,
  currentPlayer,
}: {
  room: RoomData;
  currentPlayer: Player;
}) {
  const [room, setRoom] = useState<RoomData>(initialRoom);
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [showRedistribution, setShowRedistribution] = useState(false); // For showing role redistribution option
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [roomUrl, setRoomUrl] = useState('');
  
  // Admin settings state
  const [questionCount, setQuestionCount] = useState(initialRoom.questionCount || 5);
  const [questionType, setQuestionType] = useState(initialRoom.questionType || 'MIXED');

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(`room-${room.id}`);

    channel.bind('player-joined', (newPlayer: Player) => {
      setRoom((prev) => {
        if (prev.players.find((p) => p.id === newPlayer.id)) return prev;
        return { ...prev, players: [...prev.players, newPlayer] };
      });
    });

    channel.bind('player-left', (data: { playerId: string }) => {
      setRoom(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== data.playerId)
      }));
    });

    channel.bind('game-started', (updatedRoom: RoomData) => {
      setRoom((prev) => ({
        ...prev,
        ...updatedRoom,
        evaluations: prev.evaluations,
      }));
    });

    channel.bind('evaluations-revealed', () => {
      window.location.reload();
    });

    channel.bind('next-round', (data: RoomData) => {
      console.log('Next round event received:', data);
      if (data && data.players) {
        setRoom(prev => ({
          ...prev,
          ...data,
          evaluations: prev.evaluations // keep current evaluations
        }));
      } else {
        window.location.reload();
      }
    });

    channel.bind('room-closed', () => {
      setRoom(prev => ({ ...prev, status: 'CLOSED' }));
    });

    channel.bind('game-finished', () => {
      setRoom(prev => ({ ...prev, status: 'FINISHED' }));
    });

    // Polling Fallback: If Pusher keys are missing or it fails, 
    // refresh the room data every 5 seconds to ensure real-time feel.
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/room/${room.id}?player=${currentPlayer.id}`);
        if (response.ok) {
          const freshData = await response.json();
          setRoom(prev => {
            // Only update if there's a meaningful change (players count or status)
            if (
              freshData.players.length !== prev.players.length || 
              freshData.status !== prev.status ||
              freshData.currentRound !== prev.currentRound
            ) {
              return { ...prev, ...freshData };
            }
            return prev;
          });
        }
      } catch (e) {
        // Silently fail polling
      }
    }, 5000);

    return () => {
      channel.unbind_all();
      client.unsubscribe(`room-${room.id}`);
      clearInterval(pollInterval);
    };
  }, [room.id]);

  useEffect(() => {
    if (room.status === 'CLOSED') {
      router.push('/');
    }
  }, [room.status, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/?join=${room.id}`);
    }
  }, [room.id]);

  const updatedCurrentPlayer =
    room.players.find((p) => p.id === currentPlayer.id) || currentPlayer;

  const handleStartGame = async () => {
    if (room.players.length < 2) {
      alert('يجب أن يكون هناك على الأقل 2 لاعبين لبدء الجلسة');
      return;
    }
    
    setIsStarting(true);
    
    try {
      // Update room settings if they've changed
      if (questionCount !== initialRoom.questionCount || questionType !== initialRoom.questionType) {
        await updateRoomSettings(room.id, questionCount, questionType);
      }
      
      // Assign random roles
      await assignRandomRoles(room.id);
      // Reload to pick up the new game state
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء بدء الجلسة');
      setIsStarting(false);
    }
  };

  const handleRedistributeRoles = async () => {
    if (!confirm('هل أنت متأكد من توزيع الأدوار من جديد؟')) return;
    
    setIsStarting(true);
    
    try {
      await assignRandomRoles(room.id);
      // Reload to pick up the new game state
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء إعادة توزيع الأدوار');
      setIsStarting(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
    
    try {
      await removePlayer(room.id, playerId);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء حذف المشارك');
    }
  };

  const startEditingPlayer = (playerId: string, currentName: string) => {
    setEditingPlayerId(playerId);
    setEditedName(currentName);
  };

  const savePlayerName = async (playerId: string) => {
    if (!editedName.trim()) {
      alert('الاسم لا يمكن أن يكون فارغًا');
      return;
    }
    
    try {
      await updatePlayerName(room.id, playerId, editedName.trim());
      setEditingPlayerId(null);
      // Refresh the page to get updated player data
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء تحديث الاسم');
    }
  };

  const handleReveal = async () => {
    if (!confirm('هل أنت متأكد من كشف النتائج؟')) return;
    try {
      await revealEvaluations(room.id);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء كشف النتائج');
    }
  };

  const handleBackToSettings = async () => {
    if (!confirm('هل أنت متأكد من العودة للإعدادات؟ سيتم حذف جميع التقييمات الحالية.')) return;
    try {
      await resetRoomToLobby(room.id);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء العودة للإعدادات');
    }
  };

  // ─── LOBBY VIEW ──────────────────────────────────────────
  if (room.status === 'LOBBY') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        dir="rtl"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/[0.04] backdrop-blur-xl text-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-l from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              لوحة تحكم الجلسة
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              شارك الرابط أدناه مع المشاركين للانضمام
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-slate-800/60 p-3 rounded-lg text-center select-all cursor-pointer font-mono text-xs border border-slate-700 break-all">
              {roomUrl}
            </div>

            {/* Admin Controls for Question Bank Settings */}
            {currentPlayer.isHost && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="font-bold mb-3 text-slate-200">إعدادات بنك الأسئلة:</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="block text-sm font-medium mb-1 text-slate-300">
                      عدد الأسئلة:
                    </Label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-slate-800/50 border-slate-700 text-white rounded-lg p-2"
                      disabled={!currentPlayer.isHost}
                    >
                      {QUESTION_COUNTS.map(count => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium mb-1 text-slate-300">
                      نوع الأسئلة:
                    </Label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full bg-slate-800/50 border-slate-700 text-white rounded-lg p-2"
                      disabled={!currentPlayer.isHost}
                    >
                      {Object.values(QUESTION_TYPES).map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold mb-2 text-slate-200">
                المشاركين ({room.players.length}):
              </h3>
              <ul className="space-y-2">
                {room.players.map((p) => (
                  <li
                    key={p.id}
                    className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col"
                  >
                    <div className="flex justify-between items-center">
                      {editingPlayerId === p.id ? (
                        <div className="flex flex-1 items-center space-x-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                            autoFocus
                          />
                          <Button
                            onClick={() => savePlayerName(p.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-500"
                          >
                            حفظ
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-200 flex-1">
                          {p.name}{' '}
                          {p.id === currentPlayer.id && (
                            <span className="text-xs text-blue-400">(أنت)</span>
                          )}
                        </span>
                      )}
                      
                      <div className="flex space-x-2">
                        {p.id === currentPlayer.id || currentPlayer.isHost ? (
                          <>
                            {!editingPlayerId && (
                              <Button
                                onClick={() => startEditingPlayer(p.id, p.name)}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              >
                                تعديل
                              </Button>
                            )}
                            
                            {(currentPlayer.isHost && p.id !== currentPlayer.id) && (
                              <Button
                                onClick={() => handleRemovePlayer(p.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-600/20"
                              >
                                حذف
                              </Button>
                            )}
                          </>
                        ) : null}
                        
                        {p.isHost && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30 mr-2">
                            المضيف
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <PlayerRoleDisplay 
                      player={p} 
                      isCurrentUser={p.id === currentPlayer.id} 
                    />
                  </li>
                ))}
              </ul>
            </div>

            {currentPlayer.isHost ? (
              <>
                <Button
                  onClick={handleStartGame}
                  disabled={isStarting}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
                >
                  {isStarting ? 'جاري البدء...' : '🚀 بدء التدريب وتوزيع الأدوار'}
                </Button>
                
                {room.players.length >= 2 && (
                  <Button
                    onClick={() => setShowRedistribution(!showRedistribution)}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    {showRedistribution ? 'إخفاء' : 'إظهار'} توزيع الأدوار
                  </Button>
                )}
                
                {showRedistribution && room.players.length >= 2 && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300 text-sm mb-3">سيتم تعيين الأدوار عشوائيًا:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="text-green-400">• أول لاعب: بائع</li>
                      <li className="text-yellow-400">• ثاني لاعب: عميل</li>
                      <li className="text-purple-400">• البقية: مقيّمون</li>
                    </ul>
                    <Button
                      onClick={handleRedistributeRoles}
                      disabled={isStarting}
                      className="mt-3 w-full bg-amber-600 hover:bg-amber-500"
                    >
                      إعادة التوزيع
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-slate-500 text-sm">
                في انتظار المضيف لبدء التدريب...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── GAME VIEW ──────────────────────────────────────────
  const targetPlayer = room.players.find((p) => p.role === 'SELLER');
  const hasEvaluated = room.evaluations.some(
    (e: any) => e.evaluatorId === currentPlayer.id && e.roundNumber === room.currentRound
  );

  return (
    <div
      className="min-h-screen p-4 md:p-8 bg-page-gradient transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl text-slate-900 dark:text-white transition-all">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.jpeg" 
              alt="Logo" 
              className="h-10 sm:h-12 w-auto object-contain rounded-lg shadow-lg border border-white/10"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-l from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                جسر — محاكي المبيعات (الجولة {room.currentRound})
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                أنت مسجل كـ:{' '}
                <span className="font-semibold text-slate-200">
                  {currentPlayer.name}
                </span>
                {' · '}
                <span className="text-blue-400">
                  {updatedCurrentPlayer.role === 'SELLER' && 'بائع'}
                  {updatedCurrentPlayer.role === 'CLIENT' && 'عميل'}
                  {updatedCurrentPlayer.role === 'EVALUATOR' && 'مُقيّم'}
                </span>
              </p>
            </div>
          </div>
          
          {/* Show question type and count in game */}
          <div className="text-sm text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full">
            {QUESTION_TYPES[room.questionType as keyof typeof QUESTION_TYPES]?.name || 'مزيج'} • {room.questionCount} أسئلة
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {currentPlayer.isHost && room.status === 'FINISHED' && (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20 animate-pulse">
                  اكتملت جميع الأدوار! يمكنك الآن كشف النتائج النهائية
                </span>
                <Button
                  onClick={handleReveal}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-green-500/20 border-0 transition-all hover:scale-105 active:scale-95"
                >
                  📢 كشف النتائج النهائية
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Game finished view */}
        {room.status === 'FINISHED' && (
          <Card className="w-full mt-6 bg-slate-900 text-white rtl overflow-hidden shadow-xl border-slate-700">
            <CardHeader className="bg-slate-800 border-b border-slate-700">
              <CardTitle className="text-2xl font-bold text-center text-green-400">
                🏁 انتهت اللعبة! تم تدوير الأدوار بنجاح
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-lg text-slate-300 mb-4">
                  لقد انتهت جلسة التدريب بعد أن حصل كل المشاركين على فرصة تجربة الأدوار المختلفة!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                  {room.players.map((player, index) => {
                    const rolesHistory = JSON.parse(player.rolesHistory || "[]");
                    const sellerCount = rolesHistory.filter((r: string) => r === 'SELLER').length;
                    const clientCount = rolesHistory.filter((r: string) => r === 'CLIENT').length;
                    const evaluatorCount = rolesHistory.filter((r: string) => r === 'EVALUATOR').length;
                    
                    return (
                      <Card key={player.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg text-cyan-300">{player.name}</h3>
                          <div className="mt-2 text-sm">
                            <p>دور البائع: {sellerCount} مرة</p>
                            <p>دور العميل: {clientCount} مرة</p>
                            <p>دور المُقيِّم: {evaluatorCount} مرة</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {currentPlayer.isHost && (
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-6 py-3 text-lg rounded-xl"
                  >
                    بدء جلسة جديدة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Revealed results */}
        {room.status === 'REVEALED' && (
          <ResultsRevealModal
            evaluations={room.evaluations}
            isHost={currentPlayer.isHost}
            roomId={room.id}
            players={room.players}
            currentRound={room.currentRound}
          />
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-1 space-y-6">
            <RoleCardDisplay
              role={updatedCurrentPlayer.role}
              scenarioId={room.scenarioId}
            />

            {updatedCurrentPlayer.role === 'EVALUATOR' &&
              room.status === 'IN_PROGRESS' && (
                <HiddenEvaluatorForm
                  key={`eval-form-${room.id}-${room.currentRound}`}
                  roomId={room.id}
                  evaluatorId={currentPlayer.id}
                  targetId={targetPlayer?.id || null}
                  targetName={targetPlayer?.name || null}
                  hasSubmitted={hasEvaluated}
                />
              )}
          </div>

          <div className="lg:col-span-2">
            {/* Chat removed for face-to-face focus */}
            <div className="bg-white/[0.02] border border-slate-700/50 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">🗣️</div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">المحادثة وجهاً لوجه</h3>
              <p className="text-slate-400 max-w-md">
                هذه الجولة تعتمد على التفاعل المباشر. استخدم المساحة المخصصة للتمثيل والتقييم.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
