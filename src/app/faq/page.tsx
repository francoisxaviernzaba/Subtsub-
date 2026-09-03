import { Metadata } from "next";
import { FAQSchema } from "@/components/schema";

export const metadata: Metadata = {
  title: "Frequently Asked Questions · SUB2SUB",
  description: "Answers to common questions about SUB2SUB, YouTube growth, coin earning, and boosting.",
};

const faqs = [
  {
    question: "What is SUB2SUB?",
    answer: "SUB2SUB is a platform where YouTube creators earn coins by watching boosted videos and subscribing to boosted channels. They can then spend those coins to boost their own content and grow their channel.",
  },
  {
    question: "How does SUB2SUB work?",
    answer: "Creators connect their YouTube channel, then complete tasks like watching videos or subscribing to channels to earn coins. Campaign owners spend coins to get real views and subscribers from our community.",
  },
  {
    question: "Is SUB2SUB safe for my YouTube channel?",
    answer: "Yes. We use the official YouTube Data API v3 to verify subscriptions and views. We never ask for your YouTube password, and we only use OAuth for read-only access. Your channel remains secure.",
  },
  {
    question: "How do I earn coins?",
    answer: "You earn coins by: watching boosted videos (10 XP + coins), subscribing to boosted channels (25 XP + coins), daily login streaks, completing daily quests, and inviting friends.",
  },
  {
    question: "How do I spend coins?",
    answer: "You can create video view campaigns or subscriber campaigns to boost your YouTube content. Set your budget, and real users will watch your videos or subscribe to your channel.",
  },
  {
    question: "What are the coin packages?",
    answer: "We offer several coin packages: 500 coins, 1500 coins, 5000 coins, and 12000 coins. Prices vary by package. All purchases are processed securely through Buy Me a Coffee.",
  },
  {
    question: "Can I get a refund?",
    answer: "Due to the digital nature of coins and instant delivery, we generally do not offer refunds. However, if you experience issues with your purchase, contact our support team.",
  },
  {
    question: "How does the referral system work?",
    answer: "Generate your unique invite code from the Invite & Earn page. Share it with friends. When they sign up and connect their YouTube channel, you both earn bonus coins.",
  },
  {
    question: "What is the daily streak bonus?",
    answer: "Log in and complete at least one task every day to maintain your streak. Streak bonuses: 3 days = +50 coins, 7 days = +200 coins, 30 days = +1000 coins.",
  },
  {
    question: "How do I level up?",
    answer: "Earn XP by completing actions: watch videos (+10 XP), subscribe (+25 XP), daily login (+5 XP), sign up (+50 XP). Level up to unlock higher titles and climb the leaderboard.",
  },
  {
    question: "Is there a mobile app?",
    answer: "SUB2SUB is a web app that works perfectly on mobile browsers. Simply visit subtsub.vercel.app from your phone. No download required.",
  },
  {
    question: "How do I contact support?",
    answer: "You can reach us through the app's settings page or email us at support@subtsub.vercel.app. We typically respond within 24 hours.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-sm text-ink-500">Everything you need to know about SUB2SUB and growing your YouTube channel.</p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="card p-5">
            <h3 className="font-semibold text-base mb-2">{faq.question}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
      <FAQSchema faqs={faqs} />
    </div>
  );
}
