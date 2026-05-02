// Updated evaluation criteria to 5 criteria as per new requirements
export const JISR_EVALUATION_CRITERIA = [
  "الاستماع الفعّال والFocused",
  "القدرة على طرح أسئلة استكشافية فعالة",
  "التعامل مع الاعتراضات ببراعة",
  "الإقناع وبناء الثقة",
  "إغلاق المحادثة بشكل فعّال"
];

// New question types for the smart question bank
export const QUESTION_TYPES = {
  EXPLORATION: {
    id: "EXPLORATION",
    name: "أسئلة استكشافية",
    description: "أسئلة تهدف إلى فهم احتياجات العميل وتحدياته"
  },
  OBJECTION_HANDLING: {
    id: "OBJECTION_HANDLING", 
    name: "معالجة الاعتراضات",
    description: "التعامل مع الاعتراضات والتحديات من العميل"
  },
  CLOSING: {
    id: "CLOSING",
    name: "إغلاق المحادثة",
    description: "مهارات إغلاق المحادثة وتحقيق الاتفاق"
  },
  MIXED: {
    id: "MIXED",
    name: "مزيج من الأنواع",
    description: "مجموعة متنوعة من أنواع الأسئلة"
  }
};

// Question counts for admin settings
export const QUESTION_COUNTS = [3, 5, 7, 10];

// Buyer personas remain the same
export const BUYER_PERSONAS = [
  {
    id: "HR_MANAGER",
    name: "مدير الموارد البشرية",
    focus: "الامتثال، تقليل العمل اليدوي، تجربة الموظف",
    tone: "عملي، مهتم بالتفاصيل اليومية وتقليل الجهد البشري",
  },
  {
    id: "CFO",
    name: "المدير المالي",
    focus: "دقة الرواتب، التكامل مع SAP، تكلفة الأخطاء",
    tone: "دقيق، يركز على الأرقام والعوائد المالية والمخاطر",
  },
  {
    id: "OPS_MANAGER",
    name: "مدير العمليات",
    focus: "التحكم في الوردية، تسرب الاوفر تايم، الإنتاجية",
    tone: "سريع، يركز على الكفاءة ومراقبة الدوام في الفروع",
  }
];

// Enhanced scenarios with question type categorization
export const JISR_SCENARIOS = [
  {
    id: 1,
    title: " confrontation مع ZenHR - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "ZenHR",
    description: "شركة بها 300 موظف، يستخدمون ZenHR ويقولون أنه 'مقبول'.",
    hiddenPain: "دعم العملاء بطيء جداً (خارجي) ولا يحلون المشاكل إلا بعد أيام.",
    triggerQuestion: "كيف تتواصلون مع الدعم الفني، هل الرقم محلي؟ / متى آخر مرة واجهتم مشكلة وكيف تم حلها؟",
    initialObjection: "نظامنا الحالي يفي بالغرض ونحن راضون عنه تقريباً.",
    questionType: "OBJECTION_HANDLING" // Scenario suitable for objection handling
  },
  {
    id: 2,
    title: " confrontation مع Bayzat - المدير المالي",
    personaId: "CFO",
    competitor: "Bayzat",
    description: "المدير المالي يرى أن Bayzat أرخص ومناسب لميززيتهم الحالية.",
    hiddenPain: "حساب نهاية الخدمة والرواتب يتم بتعديلات يدوية وتحدث أخطاء تكلف الشركة غرامات أو وقت ضائع.",
    triggerQuestion: "كم غلطة في الرواتب يتم تصحيحها يدوياً كل شهر؟ / كيف تحسبون وقت تصحيح الأخطاء؟",
    initialObjection: "بايزات أرخص بكثير وميزانيتنا لا تسمح بزيادة التكاليف.",
    questionType: "OBJECTION_HANDLING" // Scenario suitable for objection handling
  },
  {
    id: 3,
    title: " confrontation مع Odoo - مدير العمليات",
    personaId: "OPS_MANAGER",
    competitor: "Odoo",
    description: "مدير عمليات مقتنع بأن Odoo يغطي كل احتياجاتهم.",
    hiddenPain: "التخصيص مكلف جداً، وأي تغيير في اللوائح الحكومية يتطلب الدفع لمطور خارجي.",
    triggerQuestion: "كم يستغرق تخصيص النظام أو تحديث اللوائح الجديدة من الوزارة؟ وكم يكلف؟",
    initialObjection: "أودو نظام مرن ويغطي الموارد البشرية والمبيعات وكل شيء.",
    questionType: "OBJECTION_HANDLING" // Scenario suitable for objection handling
  },
  {
    id: 4,
    title: "الامتثال والتأمينات - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "None",
    description: "الشركة تتعرض لضغوط امتثال من وزارة العمل والتأمينات الاجتماعية.",
    hiddenPain: "لديهم غرفة سابقة بسبب تأخر تحديث بيانات GOSI.",
    triggerQuestion: "هل تلقيتم أي غرامات أو تحذيرات من GOSI أو التأمينات مؤخراً؟ / كيف تتعاملون مع تحديثات GOSI؟",
    initialObjection: "الامتثال مهم لكننا ندير الأمور داخلياً بشكل مقبول.",
    questionType: "EXPLORATION" // Scenario suitable for exploration questions
  },
  {
    id: 5,
    title: "مشكلة الرواتب - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "شركة تنمو بسرعة وتواجه تحديات في دقة الرواتب.",
    hiddenPain: "الرواتب تتأخر يومين كل شهر بسبب المراجعات اليدوية.",
    triggerQuestion: "كم شخصاً يتدخل في عملية الراتب من جمع الحضور حتى التحويل البنكي؟",
    initialObjection: "فريق المالية يقوم بالمراجعة اليدوية للرواتب ولا توجد مشكلة كبيرة.",
    questionType: "EXPLORATION" // Scenario suitable for exploration questions
  },
  {
    id: 6,
    title: "الورديات والفروع - مدير العمليات",
    personaId: "OPS_MANAGER",
    competitor: "None",
    description: "شركة ريتيل (تجزئة) لديها 15 فرع وتواجه مشكلة في تتبع حضور الموظفين.",
    hiddenPain: "تسرب كبير في الأوفر تايم وتلاعب في بصمة الحضور بسبب عدم وجود ربط لحظي.",
    triggerQuestion: "كيف تتأكد أن الأوفر تايم في الفروع المتعددة حقيقي وفي حدود الميزانية؟",
    initialObjection: "مدراء الفروع يرسلون لنا شيت إكسل نهاية الشهر وهذا كافٍ.",
    questionType: "EXPLORATION" // Scenario suitable for exploration questions
  },
  {
    id: 7,
    title: " confrontation مع Palm HR - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "Palm HR",
    description: "العميل يفكر في Palm HR لأنه سمع أن أسعاره جيدة.",
    hiddenPain: "نظام Palm لا يتكامل جيداً مع GOSI وجدولة الورديات لديهم محدودة.",
    triggerQuestion: "كيف تأكدتم من مدى تكامل النظام مع GOSI وسهولة إدارة الورديات؟",
    initialObjection: "بالم أسعارهم ممتازة ونفكر في التعاقد معهم.",
    questionType: "OBJECTION_HANDLING" // Scenario suitable for objection handling
  },
  {
    id: 8,
    title: " confrontation مع Menaitech - المدير المالي",
    personaId: "CFO",
    competitor: "Menaitech",
    description: "شركة مقاولات بـ 800 موظف، مقيدة مع النظام منذ 3 سنوات.",
    hiddenPain: "النظام قديم وبطيء، والتقارير لا تساعد في اتخاذ القرارات.",
    triggerQuestion: "هل التقارير التي تستخرجونها تساعدكم في تقليل التكاليف أم هي مجرد أرشفة؟",
    initialObjection: "كل الأنظمة متشابهة ونحن معتصمون بالنظام منذ سنوات.",
    questionType: "OBJECTION_HANDLING" // Scenario suitable for objection handling
  },
  {
    id: 9,
    title: "الربط مع ERP - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "الشركة تستخدم SAP وتريد نظام للموارد البشرية يتصل به.",
    hiddenPain: "عملية التصدير والاستيراد بين النظامين تأخذ 3 أيام من عمل محاسب كل شهر.",
    triggerQuestion: "كيف تتم عملية نقل البيانات حالياً إلى SAP؟ هل هي مؤتمتة؟",
    initialObjection: "سنستمر في استخدام نظام HR الحالي ونقوم بربطه برمجياً لاحقاً.",
    questionType: "EXPLORATION" // Scenario suitable for exploration questions
  },
  {
    id: 10,
    title: "صعوبة الاستخدام - مدير العمليات",
    personaId: "OPS_MANAGER",
    competitor: "None",
    description: "الموظفون لا يستخدمون نظام الـ HR بسبب تعقيده.",
    hiddenPain: "طلبات الإجازات تتراكم ورقياً لأن تطبيق الموبايل الحالي للنظام سيء.",
    triggerQuestion: "ما هي نسبة الموظفين الذين يعتمدون كلياً على تطبيق الجوال لتقديم طلباتهم؟",
    initialObjection: "النظام مليء بالمميزات وهذا هو الأهم.",
    questionType: "EXPLORATION" // Scenario suitable for exploration questions
  },
  {
    id: 11,
    title: "تكلفة اللا فعل - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "None",
    description: "العميل يقول: سنكمل الربع بالنظام الحالي ثم نراجع.",
    hiddenPain: "موسم التوظيف القادم سيؤدي إلى انهيار العملية اليدوية الحالية.",
    triggerQuestion: "موسم التوظيف قادم، كم موظفاً جديداً ستوظفون؟ وهل عمليتكم الحالية تتحمل ذلك؟",
    initialObjection: "ليست أولوية الآن، سنراجع الموضوع بعد 3 أشهر.",
    questionType: "CLOSING" // Scenario suitable for closing questions
  },
  {
    id: 12,
    title: "الدعم الفني السيء - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "الشركة تواجه مشاكل متكررة في النظام.",
    hiddenPain: "تأخر حل المشاكل أدى لخطأ في حساب مكافآت العام الماضي.",
    triggerQuestion: "آخر مشكلة واجهتكم في النظام، كم استغرق حلها وما كانت تكلفتها على الشركة؟",
    initialObjection: "نحن ندفع رسوم صيانة سنوية والدعم موجود وإن كان بطيئاً.",
    questionType: "CLOSING" // Scenario suitable for closing questions
  }
];

// Achievement badges for gamification
export const ACHIEVEMENTS = [
  {
    id: "FIRST_SELL",
    title: "الصفقة الأولى",
    description: "حقق أول بيع ناجح في الجولة",
    icon: "🎯"
  },
  {
    id: "LISTENER",
    title: "المستمع المثالي",
    description: "حصلت على أعلى تقييم في مهارة الاستماع",
    icon: "👂"
  },
  {
    id: "OBJECTION_MASTER",
    title: "ماهر الاعتراضات",
    description: "_handling 5 اعتراضات في جولة واحدة",
    icon: "🛡️"
  },
  {
    id: "CLOSE_MASTER",
    title: "ماهر الإغلاق",
    description: "أغلق 3 محادثات بنجاح",
    icon: "✅"
  },
  {
    id: "EVALUATOR_EXCELLENCE",
    title: "مُقيم متميز",
    description: "قدم تقييمات دقيقة وشاملة لزملائك",
    icon: "⭐"
  }
];

// Random challenge cards
export const CHALLENGE_CARDS = [
  {
    id: "TIME_PRESSURE",
    challenge: "العميل لديه 2 دقيقة فقط، اجعل المحادثة مختصرة وفعالة"
  },
  {
    id: "SILENT_CLIENT",
    challenge: "العميل صامت، استخدم أسئلة مفتوحة لفتح المحادثة"
  },
  {
    id: "ANGRY_CLIENT",
    challenge: "العميل غاضب، اهدأه بأسلوبك الاحترافي"
  },
  {
    id: "TECH_CHALLENGE",
    challenge: "واجهة المستخدم معقدة، اشرحها بلغة بسيطة"
  },
  {
    id: "PRICE_OBJECTION",
    challenge: "العميل يشتكي من السعر، اعرض القيمة المقدمة"
  }
];