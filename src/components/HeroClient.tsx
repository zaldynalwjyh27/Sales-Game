'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeroClient({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden" dir="rtl">
      
      {/* Background animated blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute top-[40%] left-[20%] w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000" />
      
      <div className="absolute top-4 left-4 flex items-center gap-2 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[500px] space-y-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="p-4 rounded-3xl bg-card border border-border shadow-2xl"
          >
            <img 
              src="/logo.jpeg" 
              alt="Jisr Logo" 
              className="h-20 w-auto object-contain rounded-xl"
            />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-primary via-blue-600 to-purple-600">
              جسر — محاكي المبيعات
            </h1>
            <p className="text-muted-foreground text-lg max-w-[450px] mx-auto leading-relaxed">
              منصة تفاعلية متطورة للتدريب على مهارات الاستكشاف، معالجة الاعتراضات، وإغلاق الصفقات في بيئة واقعية.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-muted-foreground/60 font-medium">
            &copy; {new Date().getFullYear()} جسر للتدريب المتقدم. جميع الحقوق محفوظة.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
