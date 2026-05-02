import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RoomClient } from './RoomClient';

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ player?: string }>;
}) {
  const { id: roomId } = await params;
  const { player: playerId } = await searchParams;

  if (!playerId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-red-400 font-bold text-lg"
        dir="rtl"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        رابط غير صالح. يرجى الدخول من الصفحة الرئيسية أو استخدام الرابط الصحيح.
      </div>
    );
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      players: true,
      evaluations: { include: { evaluator: true, target: true } },
    },
  });

  if (!room) notFound();

  const currentPlayer = room.players.find((p) => p.id === playerId);
  if (!currentPlayer) notFound();

  return <RoomClient room={room as any} currentPlayer={currentPlayer} />;
}
