import { redirect } from 'next/navigation';
import { createRoom, joinRoom } from '@/server/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8" dir="rtl">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[450px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-2xl bg-muted/50 border border-border shadow-sm mb-2">
            <img 
              src="/logo.jpeg" 
              alt="Jisr Logo" 
              className="h-16 w-auto object-contain rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              جسر — محاكي المبيعات
            </h1>
            <p className="text-muted-foreground text-lg max-w-[400px]">
              منصة تفاعلية متطورة للتدريب على مهارات الاستكشاف، معالجة الاعتراضات، وإغلاق الصفقات.
            </p>
          </div>
        </div>

        <Card className="border shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">
              {isJoining ? 'الانضمام إلى الجلسة' : 'بدء جلسة جديدة'}
            </CardTitle>
            <CardDescription>
              {isJoining 
                ? 'أدخل اسمك للانضمام إلى جلسة التدريب الحالية.' 
                : 'أنشئ غرفة تدريب جديدة وادعُ فريقك للمشاركة.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isJoining ? (
              <form action={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المشارك</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="أدخل اسمك..."
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold">
                  انضمام للغرفة
                </Button>
              </form>
            ) : (
              <form action={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="host-name">اسم المدرب (المضيف)</Label>
                  <Input
                    id="host-name"
                    name="name"
                    required
                    placeholder="أدخل اسمك..."
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold">
                  🚀 إنشاء غرفة تدريب
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} جسر للتدريب المتقدم. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}

