'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { 
  assignRandomRoles, 
  updateRoomSettings, 
  removePlayer, 
  updatePlayerName, 
  revealEvaluations, 
  resetRoomToLobby 
} from '@/server/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RoleCardDisplay } from '@/components/RoleCardDisplay';
import { HiddenEvaluatorForm } from '@/components/HiddenEvaluatorForm';
import { ResultsRevealModal } from '@/components/ResultsRevealModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QUESTION_TYPES } from '@/lib/jisr-constants';
import { User, ShieldCheck, Users, Settings, LogOut, PlayCircle, RotateCcw, Trash2, Check, Edit2, Share2, Timer, AlertTriangle } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role: string | null;
  isHost: boolean;
  isLocked: boolean;
  roomId: string;
  rolesHistory: string | null;
  createdAt: Date;
}

interface RoomData {
  id: string;
  status: string;
  currentRound: number;
  scenarioId: number | null;

  questionType: string;
  players: Player[];
  evaluations: any[];
}

export function PlayerRoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  
  const config = {
    SELLER: { label: 'بائع', variant: 'default' as const, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    CLIENT: { label: 'عميل', variant: 'default' as const, className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    EVALUATOR: { label: 'مراقب', variant: 'default' as const, className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  };

  const item = config[role as keyof typeof config];
  if (!item) return null;

  return (
    <Badge variant="outline" className={item.className}>
      {item.label}
    </Badge>
  );
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
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [roomUrl, setRoomUrl] = useState('');
  
  const [questionType, setQuestionType] = useState(initialRoom.questionType || 'MIXED');

  // Timer state (5 minutes = 300 seconds)
  const TIMER_DURATION = 300;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start/reset timer when game status changes to IN_PROGRESS or round changes
  useEffect(() => {
    if (room.status === 'IN_PROGRESS') {
      setTimeLeft(TIMER_DURATION);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room.status, room.currentRound]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const timerProgress = (timeLeft / TIMER_DURATION) * 100;
  const timerColor = timeLeft > 120 ? 'text-green-500' : timeLeft > 60 ? 'text-amber-500' : 'text-red-500';
  const timerBgColor = timeLeft > 120 ? 'bg-green-500' : timeLeft > 60 ? 'bg-amber-500' : 'bg-red-500';

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
      setRoom((prev) => ({ ...prev, ...updatedRoom, evaluations: prev.evaluations }));
    });

    channel.bind('evaluations-revealed', () => {
      window.location.reload();
    });

    channel.bind('next-round', (data: RoomData) => {
      if (data && data.players) {
        setRoom(prev => ({ ...prev, ...data, evaluations: prev.evaluations }));
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

    return () => {
      channel.unbind_all();
      client.unsubscribe(`room-${room.id}`);
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

  const updatedCurrentPlayer = room.players.find((p) => p.id === currentPlayer.id) || currentPlayer;

  const handleStartGame = async () => {
    if (room.players.length < 2) {
      alert('يجب أن يكون هناك على الأقل 2 لاعبين لبدء الجلسة');
      return;
    }
    setIsStarting(true);
    try {
      if (questionType !== initialRoom.questionType) {
        await updateRoomSettings(room.id, 5, questionType);
      }
      await assignRandomRoles(room.id);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء بدء الجلسة');
      setIsStarting(false);
    }
  };

  const handleRedistributeRoles = async () => {
    if (!confirm('هل أنت متأكد من توزيع الأدوار من جديد؟')) return;
    setIsStarting(true);
    try {
      await assignRandomRoles(room.id);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء إعادة توزيع الأدوار');
      setIsStarting(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
    try {
      await removePlayer(room.id, playerId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء حذف المشارك');
    }
  };

  const startEditingPlayer = (playerId: string, currentName: string) => {
    setEditingPlayerId(playerId);
    setEditedName(currentName);
  };

  const savePlayerName = async (playerId: string) => {
    if (!editedName.trim()) return;
    try {
      await updatePlayerName(room.id, playerId, editedName.trim());
      setEditingPlayerId(null);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'حدث خطأ أثناء تحديث الاسم');
    }
  };

  const handleReveal = async () => {
    if (!confirm('هل أنت متأكد من كشف النتائج؟')) return;
    try {
      await revealEvaluations(room.id);
    } catch (e) {
      alert('حدث خطأ أثناء كشف النتائج');
    }
  };

  const copyRoomUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    alert('تم نسخ رابط الانضمام');
  };

  // ─── LOBBY VIEW ──────────────────────────────────────────
  if (room.status === 'LOBBY') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8" dir="rtl">
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">لوحة تحكم الجلسة</h1>
              <p className="text-muted-foreground">قم بإعداد الجلسة ودعوة المشاركين للبدء.</p>
            </div>

            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    المشاركون
                  </CardTitle>
                  <CardDescription>إجمالي عدد المنضمين: {room.players.length}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyRoomUrl} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  نسخ الرابط
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {room.players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {p.name.charAt(0)}
                        </div>
                        {editingPlayerId === p.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="h-8 w-40"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={() => savePlayerName(p.id)} className="h-8 w-8">
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-medium flex items-center gap-2">
                              {p.name}
                              {p.id === currentPlayer.id && <Badge variant="secondary" className="text-[10px] h-4">أنت</Badge>}
                              {p.isHost && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                            </span>
                            <PlayerRoleBadge role={p.role} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(p.id === currentPlayer.id || currentPlayer.isHost) && !editingPlayerId && (
                          <Button variant="ghost" size="icon" onClick={() => startEditingPlayer(p.id, p.name)} className="h-8 w-8">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {currentPlayer.isHost && p.id !== currentPlayer.id && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(p.id)} className="h-8 w-8 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {room.players.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground italic">
                      بانتظار انضمام المشاركين...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  إعدادات الجلسة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="space-y-2">
                  <Label>نوع الأسئلة</Label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    disabled={!currentPlayer.isHost}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {Object.values(QUESTION_TYPES).map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {currentPlayer.isHost ? (
                  <>
                    <Button onClick={handleStartGame} disabled={isStarting || room.players.length < 2} className="w-full h-11 gap-2">
                      <PlayCircle className="h-5 w-5" />
                      بدء التدريب
                    </Button>
                    <Button variant="outline" onClick={handleRedistributeRoles} disabled={isStarting || room.players.length < 2} className="w-full gap-2">
                      <RotateCcw className="h-4 w-4" />
                      إعادة توزيع الأدوار
                    </Button>
                  </>
                ) : (
                  <div className="w-full p-4 text-center rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground italic">بانتظار المضيف لبدء الجلسة...</p>
                  </div>
                )}
              </CardFooter>
            </Card>

            <Card className="border border-blue-500/20 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-500">نصيحة سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-700/70 leading-relaxed">
                  تأكد من وجود بائع واحد وعميل واحد على الأقل قبل البدء. سيتم تعيين البقية كمقيمين تلقائياً.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME VIEW ──────────────────────────────────────────
  const targetPlayer = room.players.find((p) => p.role === 'SELLER');
  const hasEvaluated = room.evaluations.some(
    (e: any) => e.evaluatorId === currentPlayer.id && e.roundNumber === room.currentRound
  );

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="Logo" className="h-8 w-auto object-contain rounded" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight">جولة المحاكاة #{room.currentRound}</h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Badge variant="outline" className="text-[10px] h-4 py-0">
                {QUESTION_TYPES[room.questionType as keyof typeof QUESTION_TYPES]?.name || 'مزيج'}
              </Badge>
            </div>
          </div>

          {/* Countdown Timer */}
          {(room.status === 'IN_PROGRESS' || room.status === 'FINISHED') && (
            <div className="flex items-center gap-3 mr-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${timeLeft === 0 ? 'border-red-500/30 bg-red-500/10' : 'border-border/50 bg-muted/30'}`}>
                {timeLeft === 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                ) : (
                  <Timer className={`h-4 w-4 ${timerColor}`} />
                )}
                <span className={`text-sm font-mono font-bold tabular-nums ${timerColor}`}>
                  {timeLeft === 0 ? 'انتهى الوقت!' : formatTime(timeLeft)}
                </span>
              </div>
              {timeLeft > 0 && (
                <div className="hidden md:block w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerBgColor}`}
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium">أنت: {currentPlayer.name}</span>
            <Separator orientation="vertical" className="h-3" />
            <PlayerRoleBadge role={updatedCurrentPlayer.role} />
          </div>
          
          <ThemeToggle />
          
          {currentPlayer.isHost && room.status === 'FINISHED' && (
            <Button onClick={handleReveal} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold h-8">
              كشف النتائج
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Game Status Messages */}
        {room.status === 'FINISHED' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PlayCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-bold text-green-900">انتهت اللعبة!</p>
                <p className="text-sm text-green-700">تم تدوير جميع الأدوار بنجاح. المضيف يمكنه كشف النتائج الآن.</p>
              </div>
            </div>
            {currentPlayer.isHost && (
              <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="border-green-600/30 text-green-700 hover:bg-green-600/10">
                بدء جلسة جديدة
              </Button>
            )}
          </div>
        )}

        {room.status === 'REVEALED' && (
          <ResultsRevealModal
            evaluations={room.evaluations}
            isHost={currentPlayer.isHost}
            roomId={room.id}
            players={room.players}
            currentRound={room.currentRound}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Form */}
          <div className="lg:col-span-5 space-y-6">
            <RoleCardDisplay
              role={updatedCurrentPlayer.role}
              scenarioId={room.scenarioId}
            />

            {updatedCurrentPlayer.role === 'EVALUATOR' && room.status === 'IN_PROGRESS' && (
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

          {/* Main Area */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-0 shadow-none bg-muted/20 flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-3xl border border-dashed border-border/50">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">المحادثة وجهاً لوجه</h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                هذه الجولة مخصصة للتفاعل المباشر بين البائع والعميل. المقيمون يتابعون الأداء ويقومون بالتقييم عبر النموذج الجانبي.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center">
                  <Badge variant="outline" className="mb-2 text-blue-500 border-blue-500/20 bg-blue-500/5">البائع</Badge>
                  <span className="font-bold text-lg">{targetPlayer?.name || '...'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center">
                  <Badge variant="outline" className="mb-2 text-amber-500 border-amber-500/20 bg-amber-500/5">العميل</Badge>
                  <span className="font-bold text-lg">
                    {room.players.find(p => p.role === 'CLIENT')?.name || '...'}
                  </span>
                </div>
              </div>
            </Card>
            
            <div className={`grid grid-cols-1 ${updatedCurrentPlayer.role === 'EVALUATOR' ? 'md:grid-cols-2' : ''} gap-4`}>
              {(updatedCurrentPlayer.role === 'SELLER' || updatedCurrentPlayer.role === 'EVALUATOR') && (
                <Card className="p-4 border bg-card/50">
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    تعليمات البائع
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                    <li>ركز على بناء العلاقة مع العميل.</li>
                    <li>اسأل أسئلة مفتوحة للاستكشاف.</li>
                    <li>حاول فهم الاعتراضات قبل الرد عليها.</li>
                  </ul>
                </Card>
              )}
              {(updatedCurrentPlayer.role === 'CLIENT' || updatedCurrentPlayer.role === 'EVALUATOR') && (
                <Card className="p-4 border bg-card/50">
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    تعليمات العميل
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                    <li>كن واقعياً في ردود أفعالك.</li>
                    <li>قدم اعتراضات منطقية بناءً على السيناريو.</li>
                    <li>امنح البائع فرصة لتجربة مهاراته.</li>
                  </ul>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

