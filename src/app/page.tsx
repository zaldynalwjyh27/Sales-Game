import { redirect } from 'next/navigation';
import { createRoom, joinRoom } from '@/server/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroClient } from '@/components/HeroClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ join?: string }>;
}) {
  const { join } = await searchParams;
  const isJoining = !!join;

  const handleCreate = async (formData: FormData) => {
    'use server';
    const name = formData.get('name') as string;
    if (!name) return;
    const room = await createRoom(name);
    redirect(`/room/${room.id}?player=${room.players[0].id}`);
  };

  const handleJoin = async (formData: FormData) => {
    'use server';
    const name = formData.get('name') as string;
    if (!name || !join) return;
    const player = await joinRoom(join, name);
    redirect(`/room/${join}?player=${player.id}`);
  };

  return (
    <HeroClient>
      <Card className="border shadow-2xl bg-card/80 backdrop-blur-xl border-white/10 dark:border-white/5 rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            {isJoining ? 'الانضمام إلى الجلسة' : 'بدء جلسة جديدة'}
          </CardTitle>
          <CardDescription className="text-sm">
            {isJoining 
              ? 'أدخل اسمك للانضمام إلى جلسة التدريب الحالية.' 
              : 'أنشئ غرفة تدريب جديدة وادعُ فريقك للمشاركة.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isJoining ? (
            <form action={handleJoin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">اسم المشارك</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="أدخل اسمك..."
                  className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/50"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all">
                انضمام للغرفة
              </Button>
            </form>
          ) : (
            <form action={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="host-name" className="text-sm font-semibold text-foreground/80">اسم المدرب (المضيف)</Label>
                <Input
                  id="host-name"
                  name="name"
                  required
                  placeholder="أدخل اسمك..."
                  className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/50"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all">
                🚀 إنشاء غرفة تدريب
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </HeroClient>
  );
}

