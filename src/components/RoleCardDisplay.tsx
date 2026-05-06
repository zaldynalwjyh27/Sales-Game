'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BUYER_PERSONAS, JISR_SCENARIOS } from '@/lib/jisr-constants';
import { FileText, Target, BarChart3, AlertCircle, HelpCircle, Info } from 'lucide-react';

interface RoleCardProps {
  role: string | null;
  scenarioId: number | null;
}

export function RoleCardDisplay({ role, scenarioId }: RoleCardProps) {
  if (!role || !scenarioId) return null;

  const scenario = JISR_SCENARIOS.find((s) => s.id === scenarioId);
  const persona = BUYER_PERSONAS.find((p) => p.id === scenario?.personaId);

  if (!scenario || !persona) return null;

  const getRoleIcon = () => {
    switch (role) {
      case 'CLIENT': return <FileText className="h-5 w-5" />;
      case 'SELLER': return <Target className="h-5 w-5" />;
      case 'EVALUATOR': return <BarChart3 className="h-5 w-5" />;
      default: return null;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'CLIENT': return 'بطاقة العميل';
      case 'SELLER': return 'بطاقة البائع';
      case 'EVALUATOR': return 'بطاقة المراقب';
      default: return '';
    }
  };

  return (
    <Card className="w-full border shadow-sm" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="gap-1.5 py-1 px-3">
            {getRoleIcon()}
            {getRoleLabel()}
          </Badge>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">سرّي للمشارك</span>
        </div>
        <CardTitle className="text-xl font-bold">{scenario.title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{scenario.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">الشخصية</span>
            <p className="text-sm font-semibold">{persona.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">المنافس</span>
            <p className="text-sm font-semibold">{scenario.competitor}</p>
          </div>
        </div>

        <Separator />

        {(role === 'CLIENT' || role === 'EVALUATOR') && (
          <div className="space-y-4">
            {role === 'EVALUATOR' && (
              <Badge variant="outline" className="text-[10px] font-bold uppercase text-destructive border-destructive/20 bg-destructive/5">
                تعليمات العميل (سري)
              </Badge>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <AlertCircle className="h-4 w-4" />
                الاعتراض الأولي:
              </div>
              <p className="text-sm p-3 rounded-lg bg-destructive/5 border border-destructive/10 italic leading-relaxed text-destructive/80">
                "{scenario.initialObjection}"
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <HelpCircle className="h-4 w-4" />
                الألم الخفي (لا تكشفه إلا إذا سُئلت):
              </div>
              <p className="text-sm p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 italic leading-relaxed text-amber-700/80">
                "{scenario.hiddenPain}"
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Info className="h-4 w-4" />
                السؤال المفتاحي:
              </div>
              <p className="text-sm p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 italic leading-relaxed text-blue-700/80">
                "{scenario.triggerQuestion}"
              </p>
            </div>
          </div>
        )}

        {role === 'EVALUATOR' && <Separator className="my-4 border-dashed" />}

        {(role === 'SELLER' || role === 'EVALUATOR') && (
          <div className="space-y-4">
            {role === 'EVALUATOR' && (
              <Badge variant="outline" className="text-[10px] font-bold uppercase text-primary border-primary/20 bg-primary/5">
                تعليمات البائع (سري)
              </Badge>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Target className="h-4 w-4" />
                أهداف البائع في هذه الجولة:
              </div>
              <ul className="space-y-2">
                {[
                  'افتح المحادثة بسؤال قوي يجعله يتحدث.',
                  `اكتشف الألم الخفي الذي يخص هذه الشخصية (${persona.name}).`,
                  'اعترف باعتراضاته بذكاء قبل الرد عليها.',
                  'اخلق إلحاحاً طبيعياً وأغلق بخطوة تالية واضحة.'
                ].map((goal, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {role === 'EVALUATOR' && (
          <div className="space-y-4 text-center py-6 border border-dashed rounded-2xl bg-muted/20">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm font-medium">أنت في وضع المراقبة</p>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">قم بتقييم أداء البائع بناءً على ردود أفعال العميل وجودة الأسئلة ومقارنتها بالتعليمات أعلاه.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

