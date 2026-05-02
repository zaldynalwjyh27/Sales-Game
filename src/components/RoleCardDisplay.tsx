'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUYER_PERSONAS, JISR_SCENARIOS } from '@/lib/jisr-constants';

interface RoleCardProps {
  role: string | null;
  scenarioId: number | null;
}

export function RoleCardDisplay({ role, scenarioId }: RoleCardProps) {
  if (!role || !scenarioId) return null;

  const scenario = JISR_SCENARIOS.find((s) => s.id === scenarioId);
  const persona = BUYER_PERSONAS.find((p) => p.id === scenario?.personaId);

  if (!scenario || !persona) return null;

  return (
    <Card className="w-full mb-4 rtl shadow-sm border-r-4 border-r-blue-600 bg-slate-50 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-right text-blue-800 dark:text-blue-300">
          {role === 'CLIENT' && "📜 بطاقة العميل (دورك)"}
          {role === 'SELLER' && "🎯 بطاقة البائع (دورك)"}
          {role === 'EVALUATOR' && "📊 المراقب (دورك)"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-right space-y-4" dir="rtl">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">{scenario.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{scenario.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="block font-semibold text-slate-700 dark:text-slate-300">الشخصية:</span>
              <span>{persona.name}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-700 dark:text-slate-300">المنافس:</span>
              <span>{scenario.competitor}</span>
            </div>
          </div>
        </div>

        {role === 'CLIENT' && (
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-900">
              <span className="font-bold text-red-800 dark:text-red-400">الاعتراض الأولي:</span>
              <p className="text-sm mt-1 text-red-700 dark:text-red-300">"{scenario.initialObjection}"</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-100 dark:border-amber-900">
              <span className="font-bold text-amber-800 dark:text-amber-400">الألم الخفي (لا تكشفه إلا إذا سُئلت السؤال المناسب!):</span>
              <p className="text-sm mt-1 text-amber-700 dark:text-amber-300">"{scenario.hiddenPain}"</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-900">
              <span className="font-bold text-blue-800 dark:text-blue-400">السؤال الذي يفتح الألم:</span>
              <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">"{scenario.triggerQuestion}"</p>
            </div>
          </div>
        )}

        {role === 'SELLER' && (
          <div className="space-y-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded border border-emerald-100 dark:border-emerald-900">
              <span className="font-bold text-emerald-800 dark:text-emerald-400">أهدافك:</span>
              <ul className="list-disc list-inside text-sm mt-2 text-emerald-700 dark:text-emerald-300 space-y-1">
                <li>افتح المحادثة بسؤال قوي يجعله يتحدث.</li>
                <li>اكتشف الألم الخفي الذي يخص هذه الشخصية ({persona.name}).</li>
                <li>اعترف باعتراضاته قبل الرد عليها.</li>
                <li>اخلق إلحاحاً طبيعياً وأغلق بخطوة تالية.</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
