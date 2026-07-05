import { useState } from "react";
import { Card } from "../../ui/Card";

interface QuizProps {
  projectType: string;
}

export default function DiyQuizWidget({ projectType }: QuizProps) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questions = [
    {
      q: "How comfortable are you with hand/power tools (drills, saws, levels)?",
      options: [
        { text: "Beginner: Rarely use them, prefer basic tasks.", score: 1 },
        { text: "Intermediate: Use them for small home repairs.", score: 3 },
        { text: "Advanced: Confident building framing or tiling.", score: 5 },
      ],
    },
    {
      q: "Will you have helper(s) available for heavy lifting or holds?",
      options: [
        { text: "Yes: I have active friends or family members.", score: 2 },
        { text: "No: I will be executing this project completely solo.", score: 0 },
      ],
    },
    {
      q: "Are you moving or modifying major utilities (plumbing, electrical, load-bearing walls)?",
      options: [
        { text: "Yes: Involves rerouting wires, drains, or walls.", score: 0 },
        { text: "No: Only cosmetic swaps, framing, or fixtures.", score: 3 },
      ],
    },
    {
      q: "How many hours per week can you dedicate to construction?",
      options: [
        { text: "1-5 hours: Only on weekends.", score: 1 },
        { text: "6-15 hours: Evenings and weekends.", score: 3 },
        { text: "16+ hours: Dedicated full days.", score: 5 },
      ],
    },
  ];

  const handleSelect = (optionScore: number) => {
    const newAnswers = { ...answers, [step]: optionScore };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate final score
      const total = Object.values(newAnswers).reduce((sum, val) => sum + val, 0);
      setScore(total);
      setStep(step + 1);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setScore(0);
    setAnswers({});
  };

  // Steps handling
  if (step === questions.length) {
    let rating = "Red: High Professional Complexity";
    let colorClass = "text-[var(--error)] bg-[var(--error)]/5 border-[var(--error)]/20";
    let desc = "This project involves structural, utility, or high-skill labor. For safety, compliance, and long-term valuation, we strongly recommend requesting professional contractor quotes.";

    if (score >= 12) {
      rating = "Green: Highly Doable DIY";
      colorClass = "text-[var(--success)] bg-[var(--success)]/5 border-[var(--success)]/20";
      desc = "You have the experience, tools, and support needed to execute this project as a DIY build! Skip contractor fees and save significantly on labor costs.";
    } else if (score >= 7) {
      rating = "Yellow: Moderate DIY Risk";
      colorClass = "text-amber-600 bg-amber-500/5 border-amber-500/20 dark:text-amber-400";
      desc = "You can tackle the framing, board installation, or painting yourself to save money. However, consider hiring a licensed plumber/electrician to hook up utilities.";
    }

    return (
      <Card className="max-w-xl mx-auto p-6 border border-[var(--border)] bg-[var(--card-bg)] shadow-md">
        <h3 className="text-sm font-bold text-[var(--fg)] mb-3">DIY Assessment Result</h3>
        <div className={`p-4 rounded-xl border mb-4 ${colorClass}`}>
          <h4 className="text-sm font-bold mb-1">{rating}</h4>
          <p className="text-xs leading-relaxed">{desc}</p>
        </div>
        <div className="flex justify-between items-center text-xs text-[var(--fg-muted)]">
          <span>Score: {score} / 15 points</span>
          <button type="button" onClick={resetQuiz} className="text-[var(--accent)] hover:underline font-semibold cursor-pointer">
            Retake Assessment
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto border border-[var(--border)] bg-[var(--card-bg)] shadow-md">
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-[var(--fg-muted)] mb-1">
          <span>DIY Readiness Quiz</span>
          <span>Question {step + 1} of {questions.length}</span>
        </div>
        <h3 className="text-sm font-bold text-[var(--fg)]">{questions[step].q}</h3>
      </div>

      <div className="flex flex-col gap-2">
        {questions[step].options.map((opt) => (
          <button
            key={opt.text}
            type="button"
            onClick={() => handleSelect(opt.score)}
            className="w-full text-left p-3 text-xs font-medium rounded-lg border border-[var(--border)] bg-transparent hover:bg-[var(--bg-muted)] text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-all cursor-pointer"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </Card>
  );
}
