'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full bg-white/5 dark:bg-white/10 border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all shadow-sm"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-400 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-blue-400 transition-all" />
      )}
      <span className="sr-only">تبديل المظهر</span>
    </Button>
  );
}
