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
    <main
      className="min-h-screen flex items-center justify-center p-4 bg-page-gradient transition-colors duration-500"
      dir="rtl"
    >
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 transition-all">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <img 
              src="/logo.jpeg" 
              alt="Jisr Logo" 
              className="h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-2xl"
            />
          </div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-l from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            جسر — محاكي المبيعات
          </CardTitle>
          <CardDescription className="text-slate-400 text-base mt-2">
            تدريب تفاعلي على الاستكشاف ومعالجة الاعتراضات والإغلاق
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isJoining ? (
            <form action={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">
                  اسمك:
                </label>
                <Input
                  name="name"
                  required
                  placeholder="أدخل اسمك للانضمام..."
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
              >
                انضمام للغرفة
              </Button>
            </form>
          ) : (
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">
                  اسم المدرب (المضيف):
                </label>
                <Input
                  name="name"
                  required
                  placeholder="أدخل اسمك..."
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
              >
                🚀 إنشاء غرفة تدريب جديدة
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
