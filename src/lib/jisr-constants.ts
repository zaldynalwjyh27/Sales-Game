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
  },
  {
    id: "CEO",
    name: "الرئيس التنفيذي",
    focus: "النمو، الرؤية الاستراتيجية، العائد على الاستثمار، التحول الرقمي",
    tone: "استراتيجي، يهتم بالصورة الكبيرة والأثر على الأعمال",
  },
  {
    id: "IT_MANAGER",
    name: "مدير تقنية المعلومات",
    focus: "الأمان، التكامل مع الأنظمة، البنية التحتية، حماية البيانات",
    tone: "تقني، يركز على الأمان والتكامل والاستقرار التقني",
  }
];

// Enhanced scenarios with question type categorization
export const JISR_SCENARIOS = [
  {
    id: 1,
    title: "مواجهة مع ZenHR - مدير موارد بشرية",
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
    title: "مواجهة مع Bayzat - المدير المالي",
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
    title: "مواجهة مع Odoo - مدير العمليات",
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
    title: "مواجهة مع Palm HR - مدير موارد بشرية",
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
    title: "مواجهة مع Menaitech - المدير المالي",
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
    questionType: "CLOSING"
  },
  {
    id: 13,
    title: "التحول الرقمي - الرئيس التنفيذي",
    personaId: "CEO",
    competitor: "None",
    description: "شركة متوسطة (500 موظف) لا تزال تعتمد على الإكسل والأوراق في إدارة الموارد البشرية.",
    hiddenPain: "فقدوا 3 موظفين أكفاء خلال 6 أشهر بسبب تأخر معالجة طلباتهم وغياب تجربة موظف رقمية.",
    triggerQuestion: "كيف يشعر موظفوكم تجاه العمليات الإدارية الحالية؟ هل قستم معدل دوران الموظفين مؤخراً؟",
    initialObjection: "لسنا مستعجلين على التحول الرقمي، الأولوية للمبيعات حالياً.",
    questionType: "EXPLORATION"
  },
  {
    id: 14,
    title: "أمان البيانات - مدير تقنية المعلومات",
    personaId: "IT_MANAGER",
    competitor: "None",
    description: "الشركة تخزن بيانات الموظفين على سيرفر محلي قديم وتخشى الانتقال للسحابة.",
    hiddenPain: "تعرضوا لحادثة فقدان بيانات قبل 4 أشهر بسبب عطل في السيرفر واستغرق الاسترجاع أسبوعاً.",
    triggerQuestion: "ما هي خطتكم لاستمرارية الأعمال في حال تعطل السيرفر؟ متى آخر مرة اختبرتم النسخ الاحتياطي؟",
    initialObjection: "السحابة غير آمنة ونفضل الاحتفاظ ببياناتنا محلياً.",
    questionType: "OBJECTION_HANDLING"
  },
  {
    id: 15,
    title: "مواجهة مع SAP SuccessFactors - مدير تقنية المعلومات",
    personaId: "IT_MANAGER",
    competitor: "SAP SuccessFactors",
    description: "شركة كبيرة تستخدم SAP ERP وتفكر في SuccessFactors للموارد البشرية.",
    hiddenPain: "تكلفة ترخيص SuccessFactors عالية جداً وفريقهم التقني لا يملك خبرة كافية لتخصيصه.",
    triggerQuestion: "كم ميزانية التشغيل السنوية المخصصة لـ SuccessFactors؟ وكم مستشار خارجي تحتاجون؟",
    initialObjection: "نحن بيئة SAP بالكامل، لا نريد تعقيد البنية التحتية بنظام مختلف.",
    questionType: "OBJECTION_HANDLING"
  },
  {
    id: 16,
    title: "التوسع السريع - الرئيس التنفيذي",
    personaId: "CEO",
    competitor: "None",
    description: "شركة ناشئة حصلت على تمويل وستوظف 200 موظف خلال 6 أشهر.",
    hiddenPain: "عملية التوظيف والتهيئة الحالية يدوية بالكامل وتستغرق 5 أيام لكل موظف جديد.",
    triggerQuestion: "كم يوماً يستغرق تهيئة الموظف الجديد من التوقيع حتى أول يوم عمل فعلي؟",
    initialObjection: "سنتعامل مع التوظيف يدوياً الآن ونفكر في نظام لاحقاً بعد الاستقرار.",
    questionType: "CLOSING"
  },
  {
    id: 17,
    title: "حماية الأجور WPS - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "شركة مقاولات تواجه صعوبة في الامتثال لنظام حماية الأجور.",
    hiddenPain: "تلقوا إنذارين من وزارة الموارد البشرية بسبب تأخر رفع ملفات WPS.",
    triggerQuestion: "كيف تتأكدون أن ملف WPS يتطابق مع التحويلات البنكية كل شهر؟ هل واجهتم أي إنذارات؟",
    initialObjection: "المحاسب يرفع الملف يدوياً وهذا كافٍ لنا.",
    questionType: "EXPLORATION"
  },
  {
    id: 18,
    title: "مواجهة مع DarwinBox - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "DarwinBox",
    description: "الشركة تقارن بين جسر و DarwinBox كنظام عالمي.",
    hiddenPain: "DarwinBox لا يدعم التكامل مع GOSI ومدد وحماية الأجور، مما يتطلب عملاً يدوياً إضافياً.",
    triggerQuestion: "كيف ستتعاملون مع متطلبات GOSI ومدد وWPS إذا اخترتم نظاماً غير محلي؟",
    initialObjection: "نريد نظاماً عالمياً لأننا شركة متعددة الجنسيات.",
    questionType: "OBJECTION_HANDLING"
  },
  {
    id: 19,
    title: "إدارة الأداء - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "None",
    description: "الشركة ليس لديها نظام تقييم أداء رسمي وتعتمد على ملاحظات المدراء الشفهية.",
    hiddenPain: "3 موظفين رفعوا شكاوى لأن الترقيات تتم بدون معايير واضحة مما أثر على الروح المعنوية.",
    triggerQuestion: "كيف تحددون من يستحق الترقية أو الزيادة؟ وهل الموظفون يشعرون بالعدالة في ذلك؟",
    initialObjection: "تقييم الأداء ليس أولوية الآن، نركز على العمليات اليومية.",
    questionType: "EXPLORATION"
  },
  {
    id: 20,
    title: "التكامل مع البنوك - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "شركة تدفع رواتب 600 موظف عبر تحويلات بنكية يدوية كل شهر.",
    hiddenPain: "حدث خطأ في تحويل الرواتب الشهر الماضي وتم تحويل مبالغ مزدوجة لـ 15 موظفاً.",
    triggerQuestion: "كم خطوة تمر بها عملية تحويل الرواتب من الموافقة حتى وصولها لحساب الموظف؟",
    initialObjection: "البنك يوفر لنا خدمة تحويل الرواتب مباشرة ولا نحتاج نظاماً إضافياً.",
    questionType: "CLOSING"
  },
  {
    id: 21,
    title: "مواجهة مع MenaITech - مدير العمليات",
    personaId: "OPS_MANAGER",
    competitor: "Menaitech",
    description: "شركة صناعية تستخدم MenaITech منذ 5 سنوات وتشتكي من بطء النظام.",
    hiddenPain: "واجهة المستخدم قديمة والموظفون يرفضون استخدام تطبيق الجوال لتعقيده.",
    triggerQuestion: "كم نسبة الموظفين الذين يستخدمون تطبيق الجوال فعلياً؟ وما أكثر شكوى تسمعونها؟",
    initialObjection: "لقد استثمرنا كثيراً في النظام الحالي ولا نريد البدء من الصفر.",
    questionType: "OBJECTION_HANDLING"
  },
  {
    id: 22,
    title: "السعودة والتوطين - الرئيس التنفيذي",
    personaId: "CEO",
    competitor: "None",
    description: "شركة تواجه تحديات في تحقيق نسب نطاقات وزارة الموارد البشرية.",
    hiddenPain: "انتقلوا للنطاق الأصفر الشهر الماضي وتم إيقاف خدمات التأشيرات.",
    triggerQuestion: "ما نسبة السعودة الحالية لديكم؟ وهل لديكم رؤية واضحة لتوزيع الجنسيات حسب الأقسام؟",
    initialObjection: "نتابع نسب السعودة عبر موقع الوزارة مباشرة ولا نحتاج نظاماً لذلك.",
    questionType: "EXPLORATION"
  },
  {
    id: 23,
    title: "مواجهة مع Gusto - مدير تقنية المعلومات",
    personaId: "IT_MANAGER",
    competitor: "Gusto",
    description: "شركة تقنية تفكر في استخدام Gusto لأن فريقها التقني يفضل الأنظمة الأمريكية.",
    hiddenPain: "Gusto لا يدعم قوانين العمل السعودية ولا يتكامل مع أي جهة حكومية محلية.",
    triggerQuestion: "كيف ستتعاملون مع حساب نهاية الخدمة والإجازات وفق نظام العمل السعودي باستخدام نظام أمريكي؟",
    initialObjection: "فريقنا تقني ويفضل الأنظمة العالمية ذات الـ API المفتوح.",
    questionType: "OBJECTION_HANDLING"
  },
  {
    id: 24,
    title: "مكافأة نهاية الخدمة - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "شركة لديها 400 موظف وتحسب مكافآت نهاية الخدمة يدوياً على الإكسل.",
    hiddenPain: "اكتشفوا خطأ في حساب مكافأة موظف واضطروا لدفع تعويض إضافي بعد شكوى في مكتب العمل.",
    triggerQuestion: "كيف تتأكدون من دقة حساب مكافأة نهاية الخدمة لكل موظف؟ وهل واجهتم نزاعات بسبب ذلك؟",
    initialObjection: "المحاسب لدينا خبير ويعرف القانون جيداً، لا نحتاج نظاماً لذلك.",
    questionType: "CLOSING"
  },
  {
    id: 25,
    title: "إدارة الإجازات الفوضوية - مدير العمليات",
    personaId: "OPS_MANAGER",
    competitor: "None",
    description: "شركة ضيافة فيها 800 موظف وتعاني من فوضى في جدولة الإجازات خاصة في المواسم.",
    hiddenPain: "في موسم الحج الماضي تغيب 40% من الموظفين بسبب سوء تنسيق الإجازات وخسروا عقداً كبيراً.",
    triggerQuestion: "كيف تتعاملون مع طلبات الإجازات في المواسم؟ وهل واجهتم نقصاً مفاجئاً في القوى العاملة؟",
    initialObjection: "مدراء الأقسام ينسقون الإجازات بينهم عبر الواتساب وهذا يكفي.",
    questionType: "EXPLORATION"
  },
  {
    id: 26,
    title: "العائد على الاستثمار - الرئيس التنفيذي",
    personaId: "CEO",
    competitor: "None",
    description: "الرئيس التنفيذي يريد تبريراً مالياً واضحاً قبل الاستثمار في نظام HR.",
    hiddenPain: "يقضي فريق HR من 4 أشخاص 60% من وقتهم في مهام إدارية يدوية بدلاً من التطوير الاستراتيجي.",
    triggerQuestion: "كم ساعة أسبوعياً يقضيها فريق HR في مهام يدوية مثل إدخال البيانات والتقارير؟",
    initialObjection: "لم أرَ عائداً واضحاً على الاستثمار في أنظمة HR سابقاً.",
    questionType: "CLOSING"
  },
  {
    id: 27,
    title: "مواجهة مع BambooHR - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "BambooHR",
    description: "مدير HR أعجبه عرض BambooHR التجريبي ويريد التعاقد معهم.",
    hiddenPain: "BambooHR لا يدعم اللغة العربية بشكل كامل ولا يتوافق مع نظام العمل السعودي.",
    triggerQuestion: "هل جربتم إصدار كشف راتب بالعربي أو حساب إجازة وفق المادة 109 من نظام العمل؟",
    initialObjection: "BambooHR سهل الاستخدام وتصميمه جميل والتجربة المجانية أعجبتنا.",
    questionType: "OBJECTION_HANDLING"
  },
  {
    id: 28,
    title: "تقارير مجلس الإدارة - المدير المالي",
    personaId: "CFO",
    competitor: "None",
    description: "المدير المالي يقضي 3 أيام شهرياً في تجميع تقارير الموارد البشرية لمجلس الإدارة.",
    hiddenPain: "التقارير تصل متأخرة وغير دقيقة مما أدى لاتخاذ قرارات توظيف خاطئة الربع الماضي.",
    triggerQuestion: "كم يستغرق تجميع تقرير شامل عن تكاليف القوى العاملة؟ وهل تثقون في دقة الأرقام؟",
    initialObjection: "لدينا محلل بيانات يستخرج التقارير من الإكسل وهذا يكفي.",
    questionType: "EXPLORATION"
  },
  {
    id: 29,
    title: "الامتثال لنظام العمل الجديد - مدير موارد بشرية",
    personaId: "HR_MANAGER",
    competitor: "None",
    description: "صدرت تعديلات جديدة على نظام العمل وHR يحتاج تحديث سياساته.",
    hiddenPain: "لم يستطيعوا تطبيق التعديلات الأخيرة على ساعات العمل المرنة وتلقوا ملاحظة من التفتيش.",
    triggerQuestion: "كيف تتابعون التحديثات في نظام العمل؟ وكم يستغرق تطبيق أي تعديل جديد على سياساتكم؟",
    initialObjection: "نتابع التعديلات عبر المحامي ونحدّث السياسات يدوياً.",
    questionType: "CLOSING"
  },
  {
    id: 30,
    title: "تكامل الأنظمة المتعددة - مدير تقنية المعلومات",
    personaId: "IT_MANAGER",
    competitor: "None",
    description: "الشركة تستخدم 5 أنظمة مختلفة (حضور، رواتب، إجازات، توظيف، أداء) غير مترابطة.",
    hiddenPain: "فريق IT يقضي 20 ساعة أسبوعياً في نقل البيانات يدوياً بين الأنظمة وحدث تضارب في بيانات 50 موظفاً.",
    triggerQuestion: "كم نظاماً تستخدمون لإدارة الموارد البشرية؟ وكم مرة تحدث أخطاء بسبب عدم تزامن البيانات؟",
    initialObjection: "كل نظام متخصص في مجاله وهذا أفضل من نظام واحد يفعل كل شيء بشكل متوسط.",
    questionType: "MIXED"
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