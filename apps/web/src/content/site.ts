/**
 * All marketing copy for the website lives here, so it can be edited in one
 * place. Pages, structured data (JSON-LD), sitemap and llms.txt read from it.
 */

export const site = {
  name: "Laziless",
  tagline: "Tiny tasks. A little less lazy.",
  /** One-sentence definition. Used for meta descriptions and answer engines. */
  description:
    "Laziless is a habit app that beats laziness with tiny, frequent tasks — drink water, stretch, climb stairs, breathe — nudging you every 15 to 90 minutes during your active hours.",
  keywords: [
    "habit tracker",
    "anti-procrastination app",
    "beat laziness",
    "micro habits",
    "tiny habits",
    "drink water reminder",
    "stretch reminder",
    "movement break reminder",
    "desk break app",
    "healthy habits app",
  ],
  locale: "en_US",
  /** Shown in the footer. Replace with your contact address before launch. */
  contactEmail: "" as string,
  social: {
    // Fill in real profile URLs; empty entries are skipped everywhere.
    x: "",
    instagram: "",
    github: "",
  } as Record<string, string>,
} as const;

export const nav = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
] as const;

export const howItWorks = [
  {
    emoji: "⏱️",
    title: "Pick your rhythm",
    body: "Choose how often you want a nudge (every 15 to 90 minutes) and the hours you're awake and active.",
  },
  {
    emoji: "🔔",
    title: "Get one tiny task",
    body: "At each interval, Laziless picks a random small activity: a glass of water, 10 squats, a neck roll, a short walk.",
  },
  {
    emoji: "✅",
    title: "Do it, and watch it add up",
    body: "Tap Done, Snooze or Skip. Every small win counts toward your daily total and your streak.",
  },
] as const;

export const features = [
  {
    emoji: "🎲",
    title: "Random tiny tasks",
    body: "A fresh activity every time, never the same one twice in a row, so it never gets boring.",
  },
  {
    emoji: "🕘",
    title: "Active hours",
    body: "Nudges only during the hours you choose. Nothing at night, and no backlog of missed reminders in the morning.",
  },
  {
    emoji: "😴",
    title: "Snooze, skip, pause",
    body: "Busy right now? Snooze for 10 minutes, skip without guilt, or pause everything for a while.",
  },
  {
    emoji: "🔥",
    title: "Streaks and daily stats",
    body: "See how many tiny things you did today and how many days in a row you've kept going.",
  },
  {
    emoji: "✍️",
    title: "Your own activities",
    body: "Add the micro-habits that matter to you, like watering the plants or practicing a word in a new language.",
  },
  {
    emoji: "🔒",
    title: "Private by design",
    body: "No account needed. Your activity history stays on your device.",
  },
] as const;

/** Upcoming work shown on the features page. Keep it honest. */
export const roadmap = [
  { title: "iOS and Android app", body: "Reliable reminders in the background, even when your phone is locked." },
  { title: "Gentle reminders on your wrist", body: "Smartwatch nudges, so you don't have to pick up your phone." },
  { title: "Sync across devices", body: "Optional account to keep your streak on the web and on your phone." },
] as const;

export const principles = [
  {
    title: "Small beats big",
    body: "A big goal like “work out for an hour” is easy to put off. A tiny task like “do 10 squats” is easy to start, and starting is the hard part.",
  },
  {
    title: "Frequent, not forceful",
    body: "Regular, light nudges build momentum without guilt. You can always snooze or skip.",
  },
  {
    title: "Respect your time and data",
    body: "Reminders only during your active hours. No ads, no selling data, no account required.",
  },
] as const;

/**
 * FAQ: written as real questions people ask search and AI assistants, with
 * short, direct answers first. Rendered on /faq and as FAQPage JSON-LD.
 */
export const faqs = [
  {
    q: "What is Laziless?",
    a: "Laziless is a free habit app that helps you beat laziness with tiny, frequent tasks. Every 15 to 90 minutes during your active hours, it nudges you to do one small thing, like drinking a glass of water, stretching, or climbing a flight of stairs.",
  },
  {
    q: "How does Laziless help with laziness and procrastination?",
    a: "It shrinks every action until it's too small to resist. Instead of one big goal you keep postponing, you get a steady stream of 30-second to 2-minute tasks. Finishing small tasks builds momentum, and the daily count and streak make progress visible.",
  },
  {
    q: "How often will Laziless remind me?",
    a: "You choose: every 15, 20, 30, 45, 60 or 90 minutes. The default is every 30 minutes. Reminders only happen inside your active hours (9:00 to 21:00 by default), and you can change both at any time.",
  },
  {
    q: "What kind of tiny tasks does it suggest?",
    a: "Drinking water, standing up and stretching, neck and shoulder rolls, deep breathing, looking far away to rest your eyes, squats, wall push-ups, a 2-minute walk, climbing stairs, tidying your desk and getting fresh air. You can switch any of them off and add your own.",
  },
  {
    q: "Is Laziless free?",
    a: "Yes. The web version is free to use, with no account or sign-up required.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Laziless works without an account. Your settings and history are stored on your own device.",
  },
  {
    q: "Is there a mobile app?",
    a: "An iOS and Android app is in development. Until then, you can try Laziless in your browser on the demo page.",
  },
  {
    q: "Why don't I get reminders when my browser is closed?",
    a: "Web browsers can only show notifications while they're running. Keep the Laziless tab open (it can be in the background) and allow notifications. The upcoming mobile app will remind you even when the app is closed.",
  },
  {
    q: "Is it good to drink water every 5 minutes?",
    a: "No. That's far more often than you need. Laziless spreads water reminders out among other activities and defaults to one nudge every 30 minutes, so you sip regularly without overdoing it. Your total daily water needs depend on your body, activity and climate; ask a health professional if you're unsure.",
  },
  {
    q: "Is Laziless a medical or fitness program?",
    a: "No. Laziless is a general wellbeing and habit tool, not medical advice. If you have a health condition, check with a doctor before starting new physical activity.",
  },
] as const;

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  /**
   * Sample entries are marked `placeholder: true`. They show only in
   * development (with a "Placeholder" label) and are hidden in production,
   * so made-up quotes never go live. Replace them with real, permitted quotes.
   */
  placeholder?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: "Replace me with a real quote from a beta user, e.g. how tiny tasks changed their workday.",
    name: "Beta user",
    role: "Software developer",
    placeholder: true,
  },
  {
    quote: "Replace me with a real quote, e.g. about drinking more water or moving more.",
    name: "Beta user",
    role: "Student",
    placeholder: true,
  },
  {
    quote: "Replace me with a real quote, e.g. about the streak keeping them motivated.",
    name: "Beta user",
    role: "Remote worker",
    placeholder: true,
  },
];

export const visibleTestimonials = (): Testimonial[] =>
  process.env.NODE_ENV === "production" ? testimonials.filter((t) => !t.placeholder) : testimonials;
