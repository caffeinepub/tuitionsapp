import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface FreeTimeRobotProps {
  mode: "teacher" | "student";
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

// ── Teacher-mode responses ──────────────────────────────────────────────────
function teacherResponse(input: string): string {
  const q = input.toLowerCase();
  const original = input;

  // Helper: extract the topic the teacher wants to write about/for
  function extractTopic(str: string): string {
    // Try to grab everything after about/regarding/on/for/to
    const match = str.match(/(?:about|regarding|on|for|to)\s+(.+)/i);
    if (match) return match[1].trim();
    // Otherwise strip the action verb + object word and return the remainder
    const stripped = str
      .replace(
        /^(craft|write|draft|compose|create|generate|make|send|prepare|help me write|help write)\s+(a\s+|an\s+)?(message|email|announcement|note|letter|reminder|feedback|reply|text|post|update|summary|report|plan|lesson plan|quiz|test|template)?\s*(about|for|regarding|on|to)?\s*/i,
        "",
      )
      .trim();
    return stripped || "this topic";
  }

  // ── PRIORITY 1: Action intents — user wants the bot to generate actual content
  const isActionRequest =
    /^(craft|write|draft|compose|create|generate|make|help me write|help write|send|prepare)\b/i.test(
      q,
    ) ||
    /(craft|write|draft|compose|generate|create|make)\s+(a\s+|an\s+)?(message|email|announcement|note|letter|reminder|feedback|reply|text|post|update|report|plan|quiz|test)/i.test(
      q,
    );

  if (isActionRequest) {
    const topic = extractTopic(original);
    const topicCap = topic.charAt(0).toUpperCase() + topic.slice(1);

    // Announcement / event / news
    if (
      /announcement|news|update|notice|event|class.*coming|coming.*class|session|workshop|free.*class|special.*class|class.*special/i.test(
        q,
      )
    ) {
      return `Here's a ready-to-send announcement:\n\n"Hi everyone! 🎉 ${topicCap}. This is a wonderful opportunity — make sure you don't miss it! Stay tuned for more details on the date, time, and location. If you have any questions, feel free to reach out.\n\nBest,\n[Teacher Name]"\n\nFeel free to personalise the date, time, and any other details before sending!`;
    }

    // Feedback / comment for a student
    if (/feedback|comment|review|report.*student|student.*report/i.test(q)) {
      return `Here's some feedback you can adapt:\n\n"Dear [Student Name],\n\n${topicCap}. Your effort and dedication are clearly showing in your work — keep building on this strong foundation. One area to focus on going forward: push yourself to go a little deeper in your explanations and support your points with examples. Overall, you should be very proud of your progress!\n\nKeep it up,\n[Teacher Name]"\n\nReplace the bracketed parts with specific details for the student!`;
    }

    // Parent / guardian message
    if (/parent|guardian|family/i.test(q)) {
      return `Here's a parent message you can use:\n\n"Dear Parent/Guardian,\n\nI hope this message finds you well. I wanted to reach out regarding ${topic}. Your child has been working hard and I'd love to keep you informed as we move forward. Please don't hesitate to get in touch if you have any questions or would like to discuss further.\n\nKind regards,\n[Teacher Name]"\n\nPersonalise with specific student details before sending!`;
    }

    // Absent / missed class message
    if (/absent|miss|not.*attend|attendance/i.test(q)) {
      return `Here's a check-in message:\n\n"Hi [Student Name], I noticed you were absent recently and wanted to check in — I hope everything is okay! We covered ${topic} while you were away. I've kept a summary for you. Let me know if you'd like to catch up or if you need any help getting back up to speed.\n\nTake care,\n[Teacher Name]"`;
    }

    // Motivation / encouragement
    if (/motivat|encourage|struggling|low.*grade|fail|boost/i.test(q)) {
      return `Here's an encouraging message:\n\n"Hi [Student Name], I just wanted to reach out and say — I see how hard you've been working, and that effort truly matters. Regarding ${topic}: remember that every step forward counts, no matter how small. I believe in you, and I'm here to support you every step of the way. Let's tackle this together!\n\nYour teacher,\n[Teacher Name]"`;
    }

    // Late / overdue / missing assignment
    if (
      /late|overdue|submit|deadline|assignment.*missing|missing.*assignment/i.test(
        q,
      )
    ) {
      return `Here's a gentle reminder message:\n\n"Hi [Student Name], just a quick note — I noticed ${topic}. These things happen, and I want to make sure you're okay. If you need a short extension or any help, please just let me know. I'd rather we sort this out together than have you feel overwhelmed.\n\nBest,\n[Teacher Name]"`;
    }

    // Lesson plan
    if (/lesson plan|plan.*lesson|scheme|curriculum|unit/i.test(q)) {
      return `Here's a lesson plan outline for ${topic}:\n\n📌 Objective: Students will understand the key concepts of ${topic}\n\n1. Hook (5 min): Start with a question or surprising fact related to the topic\n2. Direct Teaching (15 min): Explain the core ideas clearly, use visual aids if possible\n3. Guided Practice (10 min): Work through examples together as a class\n4. Independent Activity (15 min): Students apply what they've learned\n5. Exit Ticket (5 min): Ask students to write one thing they learned today\n\nAdjust timings based on your class length. Want me to suggest specific activities for any section?`;
    }

    // Roll call / attendance message
    if (/roll call|attendance.*message|absent.*notice/.test(q)) {
      return `Here's an attendance notice you can adapt:\n\n"Dear Students / Parents,\n\nJust a reminder that regular attendance is essential for keeping up with classwork and achieving your best results. ${topicCap}. If your child is absent, please inform us as soon as possible so we can ensure they don't fall behind.\n\nThank you for your support,\n[Teacher Name]"\n\nAdjust the details before sending!`;
    }

    // Quiz / test announcement message
    if (
      /quiz.*message|test.*message|upcoming.*quiz|upcoming.*test|exam.*message/.test(
        q,
      )
    ) {
      return `Here's a quiz/test notification message:\n\n"Hi [Class / Student Name]! 📝 Just a heads-up — ${topicCap}. Make sure you review your notes, complete any revision tasks set, and get a good night's sleep beforehand. If you have any questions about the format or content, please ask me before the day.\n\nGood luck — I know you'll do great!\n[Teacher Name]"\n\nPersonalise with the specific date, subject, and topics before sending.`;
    }

    // Progress report / end of term
    if (/progress.*report|end.*term|report.*card|term.*report/.test(q)) {
      return `Here's a progress report message template:\n\n"Dear [Parent/Guardian],\n\nI hope you're well. I wanted to share a progress update for [Student Name]. ${topicCap}. Overall, [Student Name] has been working consistently and showing real dedication. There are a few areas we are focusing on to push their results further, which I have outlined below. Please don't hesitate to contact me if you'd like to discuss this further.\n\nBest wishes,\n[Teacher Name]"\n\nAdd specific subject details and grade highlights before sending.`;
    }

    // Generic message / email / note
    return `Here's a message you can send:\n\n"Hi [Student Name / Class],\n\n${topicCap}. If you have any questions or need more information, please don't hesitate to reach out — I'm always happy to help.\n\nBest wishes,\n[Teacher Name]"\n\nFeel free to adjust the tone or add specific details before sending!`;
  }

  // ── PRIORITY 2: Greetings and meta questions
  if (/hello|hi|hey|good morning|good afternoon/.test(q))
    return "Hello! I'm Free Time Robot 🤖 — your AI teaching assistant. I can help you craft messages for students, suggest feedback wording, give class management tips, plan lessons, handle difficult situations, and much more. What do you need today?";

  if (/help|what can you do|what do you do/.test(q))
    return "I can help you with: ✏️ writing messages to students and parents, 📝 giving grade feedback, 🏫 managing student behaviour, 📚 planning lessons and assessments, 💬 communication strategies, 📋 tracking progress, and much more. Just describe your situation!";

  // ── PRIORITY 3: Advice / tips patterns (unchanged)
  if (
    /student.*message|reply.*student|respond.*student|what.*say.*student/.test(
      q,
    )
  )
    return "When replying to a student, keep it encouraging and clear. Start by acknowledging their question, then give a concise explanation. End with a follow-up like 'Does that make sense? Feel free to ask more!' — it keeps the conversation open and shows you care.";

  if (/student.*late|missing.*assignment|not.*submit/.test(q))
    return "For a student who is late on assignments, try: 'Hi [Name], I noticed your assignment hasn't been submitted yet. Is everything okay? Let me know if you need an extension or some extra help — I'm here for you.' A gentle check-in often works better than a reminder.";

  if (/motivat|encourage|boost|confidence/.test(q))
    return "To motivate a struggling student, personalise your message. Acknowledge their effort, not just the outcome. Try: 'I can see how hard you've been trying — that effort really matters. Let's work through this together, one step at a time.' Small wins build momentum.";

  if (/grade|mark|score/.test(q))
    return "When giving feedback on grades, be specific and constructive. Instead of just a number, mention what they did well and one clear area to improve. E.g. 'Great structure on your essay! For next time, focus on adding more evidence to support your main points.' Specific feedback is far more actionable.";

  if (/parent|communicate.*parent|message.*parent/.test(q))
    return "When communicating with parents, be factual, calm, and solution-focused. Lead with a positive observation before raising a concern. For example: 'Your child has shown great enthusiasm in class. I'd love to work together on improving their assignment submission consistency.'";

  if (/quiz|test|exam|assessment/.test(q))
    return "For assessments, consider mixing question types — multiple choice for recall, short answer for comprehension, and one open-ended question for critical thinking. Give students a clear rubric in advance so they know exactly what is expected. This reduces anxiety and improves results.";

  if (/class|manage.*class|student.*behaviour|behaviour/.test(q))
    return "Effective class management starts with clear expectations set on day one. Use positive reinforcement — catch students doing the right thing and acknowledge it publicly. For persistent issues, a private one-on-one chat almost always works better than public correction.";

  if (/lesson|plan|prepare|teach/.test(q))
    return "A strong lesson has three parts: a hook to grab attention (a question, story, or challenge), the core teaching content broken into digestible chunks, and a quick check for understanding at the end. Vary your delivery — mix explanation, examples, and student activity to keep engagement high.";

  if (/manage|organise|organize|handle|control/.test(q))
    return "Great student management comes down to three things: consistency (same rules, every day), relationships (know your students by name and interest), and clarity (be explicit about expectations). Start each week with a brief reset — remind the class of norms and celebrate what's going well.";

  if (/message|email/.test(q))
    return "When crafting a message to a student or parent, use this structure: (1) Open with something genuine and positive, (2) State the situation clearly and factually, (3) Share what you'd like to happen next, (4) Invite a response. Would you like me to help draft a specific message? Tell me who it's for and the situation.";

  if (/feedback|comment|report|review/.test(q))
    return "Great feedback is: Specific ('Your use of evidence in paragraph 3 was excellent'), Actionable ('Next time, try expanding your conclusion'), and Encouraging ('You're making real progress — keep it up!'). Avoid vague praise like 'Good work' — students learn more from targeted comments. Want help writing feedback for a specific student?";

  if (/difficult|problem|issue|challenge|trouble|disrupt|misbehav/.test(q))
    return "Dealing with a difficult student? Try the 'private conversation first' approach — pull them aside calmly after class and ask open questions: 'I noticed you seemed frustrated today — is everything okay?' Often behaviour is a symptom of something else. Building a small relationship with that student can transform their attitude over weeks.";

  if (/absent|attendance|skip|miss/.test(q))
    return "For attendance issues, a warm check-in message works better than a formal warning at first: 'Hi [Name], we missed you in class today! Here's what we covered: [summary]. Let me know if you need any help catching up.' If absences continue, loop in parents and the admin team early — don't wait until it becomes a pattern.";

  if (/progress|track|monitor|improve/.test(q))
    return "To track student progress effectively: (1) Use short weekly check-ins or exit tickets to gauge understanding, (2) Keep a simple record of each student's strengths and gaps, (3) Share progress updates with students — they're more motivated when they can see their own growth. Would you like a template for tracking or a message to share progress with a student?";

  if (/assign|homework|task|project|work/.test(q))
    return "For effective assignments: set a clear purpose ('This homework helps you practise X'), give a realistic time estimate, and always explain the marking criteria upfront. For projects, break them into milestones with check-in points so students don't get overwhelmed. Want help writing instructions for a specific assignment?";

  if (/engage|interest|attention|participat/.test(q))
    return "To boost student engagement, try: (1) Open lessons with a provocative question or surprising fact, (2) Use 'think-pair-share' to get quieter students talking, (3) Relate topics to real-world examples students care about, (4) Vary activity types every 10–15 minutes. Which subject or age group are you working with? I can give more targeted ideas.";

  if (/communicat|talk|speak|connect/.test(q))
    return "Strong teacher communication is about being clear, consistent, and warm. Use 'I' statements to avoid sounding accusatory ('I noticed...' rather than 'You always...'). Check for understanding by asking students to summarise rather than just nodding. With parents, regular brief updates build trust far better than only reaching out when there's a problem.";

  if (/new student|welcome|introduc/.test(q))
    return "When welcoming a new student, make the first day count: assign a friendly peer as a buddy, learn their name quickly and use it, and find out one thing they're interested in. A short private check-in at the end of the first week ('How are you settling in?') shows you genuinely care. Want a welcome message template for the new student or their parents?";

  if (/stress|burnout|overwhelm|tired/.test(q))
    return "Teacher wellbeing matters — you can't pour from an empty cup. Try these: (1) Set a hard end time for work emails each day, (2) Batch similar tasks (marking, admin) into dedicated blocks, (3) Celebrate small wins with your class — it boosts your energy too, (4) Talk to a colleague. You're not alone. What's feeling most overwhelming right now?";

  if (/tip|advice|suggest|idea|how/.test(q))
    return "Here are three high-impact teaching tips: (1) **Name + pause** — use a student's name before asking a question to boost attention, (2) **Exit tickets** — a 1-minute written reflection at lesson end tells you exactly who understood and who didn't, (3) **Specific praise** — 'I loved how you explained that in your own words, Jamie' is 10× more powerful than 'Well done.' Want more tips on a specific area?";

  if (/student/.test(q))
    return "It sounds like you have a specific student situation in mind. I can help with: writing a message to them, giving targeted feedback, handling a behaviour issue, tracking their progress, or motivating them. Could you tell me a bit more — for example, what's the challenge or what outcome you'd like? I'll give you specific advice.";

  if (/substitut|cover.*class|supply teacher/.test(q))
    return "When covering a class or setting work for a substitute, prepare a clear instruction sheet: (1) Exact task with step-by-step guidance, (2) Time breakdown per activity, (3) What students should have completed by the end, (4) Who to ask if students have questions. Leaving structured, self-directed work (reading, worksheets, reflection tasks) ensures continuity and reduces disruption.";

  if (/parent.*evening|parents.*night|open.*day|parent.*meet/.test(q))
    return "Preparing for a parent evening? Here are three key tips: (1) Review each student's grades, attendance, and any notable incidents beforehand, (2) Lead with a positive observation before discussing challenges — it keeps parents receptive, (3) End with a clear, actionable next step both you and the parent can take. Keep each slot brief and focused. If a conversation needs more time, schedule a follow-up call rather than running over.";

  if (
    /differentiat|mixed.*ability|inclusion|sen|special.*need|support.*student/.test(
      q,
    )
  )
    return "Differentiating for mixed-ability classes: (1) Use tiered tasks — same topic, different depth (basic, standard, extended), (2) Provide scaffolding for struggling students (sentence starters, word banks, partially completed examples), (3) Stretch confident students with open-ended extension questions, (4) Use flexible grouping — sometimes by ability, sometimes mixed, (5) Check in with SEN students early in the lesson, not just at the end. Small adjustments make a huge difference to inclusion.";

  if (/transition|end.*year|moving.*up|year.*group|leaving.*class/.test(q))
    return "Managing class transitions (end of year, moving year groups): (1) Write a brief handover note for the receiving teacher covering each student's strengths, support needs, and any pastoral concerns, (2) Celebrate what the class has achieved this year — a short reflection activity helps closure, (3) Prepare students emotionally — normalise that change is exciting and they will adapt quickly, (4) Ensure all grades, assessments, and records are up to date before handover.";

  if (
    /safeguard|concern|welfare|wellbeing.*student|disclose|disclosure/.test(q)
  )
    return "If a student discloses something concerning or you have a safeguarding worry: (1) Listen calmly and without judgment — don't promise confidentiality, (2) Record exactly what was said in the student's own words, as soon as possible, (3) Report it immediately to your Designated Safeguarding Lead (DSL) — do not investigate yourself, (4) Continue to be supportive to the student, but let the DSL lead. Safeguarding always takes priority over everything else.";

  if (/peer.*assess|self.*assess|marking.*scheme|rubric|criteria/.test(q))
    return "Peer and self-assessment builds metacognitive skills and reduces your marking load. Tips: (1) Always give students a clear success criteria or rubric before the task, (2) Model the process — show students what good feedback looks like, (3) Use structured sentence starters: 'One strength is... One area to improve is...', (4) For self-assessment, ask students to traffic-light their confidence (red/amber/green) — this gives you instant diagnostic data. Ensure students understand that honest, kind feedback is the goal.";

  if (
    /revision.*plan|revision.*schedule|exam.*prep|prepare.*exam|before.*exam/.test(
      q,
    )
  )
    return "Helping students prepare for exams: (1) Share a clear revision checklist by topic so students know exactly what to prioritise, (2) Recommend active revision strategies — past papers, flashcards, mind maps, teaching-back — not passive re-reading, (3) Set timed practice questions in class so students experience exam conditions, (4) Remind students that sleep and breaks are part of effective revision — not optional extras, (5) Address exam anxiety directly: normalise nerves and teach simple breathing techniques for the exam room.";

  if (/reward|certificate|praise|recognition|celebrate.*student/.test(q))
    return "Recognising student achievement boosts motivation and classroom culture. Ideas: (1) Send a positive postcard or message home — parents love hearing good news, (2) Nominate a 'Star of the Week' or 'Most Improved', (3) Use verbal praise that is specific ('I loved how you explained that concept in your own words') not generic ('Good job'), (4) Create a class achievement wall where students can post their proud moments, (5) Certificates for effort (not just results) show every student that their work is valued.";

  if (/group.*work|collaborative|team.*project|partner.*work/.test(q))
    return "Effective group work requires clear structure: (1) Assign roles (leader, recorder, presenter, timekeeper) to avoid one person doing all the work, (2) Set a clear outcome — what should the group produce by the end?, (3) Give a timeline with checkpoints, (4) Use a simple peer evaluation at the end so students reflect on contribution, (5) For mixed-ability groups, pair students thoughtfully — a confident student can model thinking, but shouldn't complete the task for others. Circulate and check in with each group every few minutes.";

  if (/introvert|quiet.*student|shy|won't.*participat|not.*engaging/.test(q))
    return "Encouraging quiet or introverted students: (1) Give thinking time before asking for answers — pose the question, give 30 seconds of silent thinking, then take responses, (2) Use written responses (mini-whiteboards, exit tickets, chat tools) so they can contribute without speaking aloud, (3) Use pair-share before whole-class discussion — it's less intimidating to share with one person first, (4) Never put shy students on the spot unexpectedly — let them choose to share, (5) Build one-on-one rapport privately; some students bloom once they trust you.";

  if (
    /first.*lesson|first.*day|new.*class|meet.*class|introduce.*yourself/.test(
      q,
    )
  )
    return "Starting well with a new class sets the tone for everything that follows. Tips: (1) Learn names quickly — use a seating plan, name cards, or a fun name game, (2) Establish classroom norms collaboratively — ask students to suggest rules, then shape and agree them together, (3) Be clear about your expectations for behaviour, participation, and homework from day one — consistency matters, (4) Show genuine interest in who they are: a brief 'tell me one thing you enjoy' activity goes a long way, (5) Keep the first lesson engaging and achievable so students leave feeling confident.";

  if (
    /homework.*policy|homework.*mark|collect.*homework|late.*homework/.test(q)
  )
    return "Managing homework effectively: (1) Be clear upfront about your homework expectations — frequency, format, submission method, (2) For late submissions, a neutral check-in ('Is everything okay? The homework wasn't in') works better than an immediate sanction, (3) Not all homework needs full marking — tick-and-flick, self-mark against a model answer, or peer-check are all valid, (4) If a student never submits, investigate the root cause (home environment, comprehension gap, workload) before escalating, (5) Make homework purposeful — students are more likely to do it if it clearly connects to classwork.";

  if (
    /professional.*development|cpd|training|career|teaching.*qualification/.test(
      q,
    )
  )
    return "Growing as a teacher: (1) Observe colleagues — even experienced teachers learn from watching others teach, (2) Reflect regularly: after each lesson, note one thing that worked and one to improve, (3) Build a portfolio of your best resources and lesson plans for career progression, (4) Engage with CPD opportunities — subject associations, webinars, and teaching communities are great resources, (5) Mentoring a student teacher or newly qualified colleague deepens your own practice significantly. Teaching is a craft — it improves steadily with deliberate reflection.";

  if (
    / data |assessment.*data|pupil.*progress|tracking.*data|gap.*analysis/.test(
      q,
    )
  )
    return "Using student data effectively: (1) Look for patterns across the class — if most students got the same question wrong, it's a teaching gap, not an individual issue, (2) Identify your 'borderline' students and target them with focused support or stretch, (3) Use pre-assessments (short diagnostic tasks) before a new unit to see what students already know, (4) Share data with students in a growth-focused way: 'You scored 65% — your target is 75%. Here's what to focus on.' (5) Data should inform your teaching, not just fill spreadsheets — always ask 'what am I going to do differently because of this?'";

  return "I'm here to help! I can assist with: 🏫 managing students, ✉️ crafting messages, 📝 writing feedback, 📚 lesson planning, 📊 tracking progress, 🗣️ communication tips, and more. Try asking something like 'Craft a message about the upcoming parent evening' or 'Write feedback for a student who did well on their essay.' What do you need?";
}

// ── Student-mode responses ──────────────────────────────────────────────────
function studentResponse(input: string): string {
  const q = input.toLowerCase();

  if (/hello|hi|hey|good morning|good afternoon/.test(q))
    return "Hey there! I'm Free Time Robot 🤖 — your friendly study companion. I'm here to cheer you on, help you stay focused, and give you tips when things get tough. What's on your mind?";

  if (/stress|anxious|worried|nervous|exam|test.*scared/.test(q))
    return "It's completely normal to feel nervous before exams! Try this: break your revision into 25-minute focused blocks with 5-minute breaks (called the Pomodoro technique). Get 8 hours of sleep the night before — your brain consolidates memory during sleep. You've done the work. Trust yourself! 💪";

  if (/motivat|lazy|can't focus|procrastinat|distract/.test(q))
    return "Struggling to focus? Try the '2-minute rule': if a task takes less than 2 minutes, do it now. For bigger tasks, just commit to starting for 5 minutes — starting is the hardest part. Once you begin, momentum takes over. You've got this! 🚀";

  if (/study.*tip|how.*study|study.*better|revise/.test(q))
    return "Top study tips: (1) Active recall beats re-reading — test yourself instead. (2) Spaced repetition works — review material at increasing intervals. (3) Teach it back — if you can explain it simply, you truly understand it. (4) Sleep is a superpower for memory. Give these a try!";

  if (/homework|assignment|task/.test(q))
    return "Tackle homework by doing the hardest subject first while your energy is highest. Break big assignments into smaller steps and check them off one by one. If you're stuck, spend 10 minutes trying before asking for help — that struggle is actually where learning happens!";

  if (/grade|mark|score|result|fail/.test(q))
    return "One grade doesn't define you! Every result is feedback, not a verdict. Look at what went well and what you can improve, then make a specific plan. Progress matters more than perfection. Your teacher is there to help — don't hesitate to ask for guidance.";

  if (/friend|social|lonely|left out/.test(q))
    return "Feeling left out can be really tough. Remember: everyone feels this way sometimes, even people who look confident. Try joining a group activity or striking up a conversation about something you have in common. Small connections grow into friendships over time. You matter! ❤️";

  if (/bored|boring|not interesting/.test(q))
    return "When something feels boring, try connecting it to something you care about. How does this topic show up in real life? In games, sports, music, or tech you love? Making that link often sparks curiosity. Also, the Learning Games section on your dashboard makes subjects way more fun — give it a try!";

  if (/help|what can you do|what do you do/.test(q))
    return "I'm here to help with: study tips, staying motivated, handling exam stress, managing homework, and just being a friendly presence when school feels overwhelming. Tell me what's going on and I'll do my best to help! 😊";

  return "Thanks for sharing that! Remember: every challenge you face at school is building resilience and skills that will help you for life. If you need specific help — whether it's study strategies, dealing with pressure, or just someone to talk to — I'm always here. Keep going! 🌟";
}

export function FreeTimeRobot({ mode }: FreeTimeRobotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text:
        mode === "teacher"
          ? "Hi! I'm Free Time Robot 🤖 — your AI teaching assistant. I can help you manage students, craft messages, give feedback tips, and more. Ask me anything!"
          : "Hey! I'm Free Time Robot 🤖 — your study buddy! I'm here to help you stay motivated, manage stress, and make school a little easier. What do you need?",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(
      () => {
        const response =
          mode === "teacher" ? teacherResponse(text) : studentResponse(text);
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, role: "bot", text: response },
        ]);
        setTyping(false);
      },
      700 + Math.random() * 500,
    );
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="ftb-btn"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setOpen(true)}
            style={{
              position: "fixed",
              bottom: mode === "student" ? "5.5rem" : "1.5rem",
              right: "1.5rem",
              zIndex: 9998,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: mode === "teacher" ? "#7c3aed" : "#0ea5e9",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
            }}
            title="Free Time Robot"
          >
            <Sparkles size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="ftb-panel"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              position: "fixed",
              bottom: mode === "student" ? "5.5rem" : "1.5rem",
              right: "1.5rem",
              zIndex: 9999,
              width: 340,
              maxWidth: "calc(100vw - 2rem)",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              border: `2px solid ${mode === "teacher" ? "#7c3aed" : "#0ea5e9"}`,
            }}
          >
            {/* Header */}
            <div
              style={{
                background:
                  mode === "teacher"
                    ? "linear-gradient(90deg,#7c3aed,#a855f7)"
                    : "linear-gradient(90deg,#0ea5e9,#38bdf8)",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    lineHeight: 1.2,
                  }}
                >
                  Free Time Robot
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 11,
                  }}
                >
                  {mode === "teacher"
                    ? "AI Teaching Assistant"
                    : "Your Study Buddy"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                height: 300,
                overflowY: "auto",
                padding: "12px 12px 6px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                scrollbarWidth: "thin",
                scrollbarColor:
                  mode === "teacher" ? "#a855f7 #f3e8ff" : "#38bdf8 #e0f2fe",
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {m.role === "bot" && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: mode === "teacher" ? "#ede9fe" : "#e0f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 7,
                        flexShrink: 0,
                        alignSelf: "flex-end",
                      }}
                    >
                      <Bot
                        size={15}
                        color={mode === "teacher" ? "#7c3aed" : "#0ea5e9"}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "8px 11px",
                      borderRadius:
                        m.role === "user"
                          ? "14px 14px 2px 14px"
                          : "14px 14px 14px 2px",
                      background:
                        m.role === "user"
                          ? mode === "teacher"
                            ? "#7c3aed"
                            : "#0ea5e9"
                          : mode === "teacher"
                            ? "#f5f3ff"
                            : "#f0f9ff",
                      color: m.role === "user" ? "#fff" : "#1e293b",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: mode === "teacher" ? "#ede9fe" : "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bot
                      size={15}
                      color={mode === "teacher" ? "#7c3aed" : "#0ea5e9"}
                    />
                  </div>
                  <div
                    style={{
                      background: mode === "teacher" ? "#f5f3ff" : "#f0f9ff",
                      borderRadius: "14px 14px 14px 2px",
                      padding: "8px 14px",
                      display: "flex",
                      gap: 4,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 0.7,
                          delay: i * 0.15,
                        }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background:
                            mode === "teacher" ? "#a855f7" : "#38bdf8",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                borderTop: `1px solid ${mode === "teacher" ? "#ede9fe" : "#e0f2fe"}`,
                padding: "10px 10px",
                display: "flex",
                gap: 7,
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={
                  mode === "teacher"
                    ? "e.g. Craft a message about the upcoming test..."
                    : "Ask me anything..."
                }
                style={{
                  flex: 1,
                  border: `1.5px solid ${mode === "teacher" ? "#ddd6fe" : "#bae6fd"}`,
                  borderRadius: 10,
                  padding: "7px 11px",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 12.5,
                  outline: "none",
                  background: mode === "teacher" ? "#faf5ff" : "#f0f9ff",
                  color: "#1e293b",
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || typing}
                style={{
                  background:
                    input.trim() && !typing
                      ? mode === "teacher"
                        ? "#7c3aed"
                        : "#0ea5e9"
                      : "#e2e8f0",
                  border: "none",
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !typing ? "pointer" : "not-allowed",
                  color: input.trim() && !typing ? "#fff" : "#94a3b8",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
