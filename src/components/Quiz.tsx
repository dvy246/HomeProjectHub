import { useState, useCallback, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizProps {
  title: string;
  questions: QuizQuestion[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ title, questions }: QuizProps) {
  const [shuffled, setShuffled] = useState<QuizQuestion[]>(questions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setShuffled(shuffleArray(questions));
  }, [questions]);

  const total = shuffled.length;
  const q = shuffled[current];

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }, [answered, q]);

  const handleNext = useCallback(() => {
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }, [current, total]);

  const handleRestart = useCallback(() => {
    const reshuffled = shuffleArray(questions);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }, [questions]);

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <h3 className="text-xl font-bold">{title} — Complete!</h3>
          <div className="text-5xl font-black tabular-nums">{score}/{total}</div>
          <p className="text-sm text-[var(--fg-secondary)]">{pct}% correct</p>
          <div className="w-full max-w-xs h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-[var(--fg-secondary)] text-pretty max-w-sm">
            {pct === 100 ? "Perfect score! You know your materials." :
             pct >= 80 ? "Great job! You have a solid understanding." :
             pct >= 60 ? "Good effort! Review the explanations to improve." :
             "Keep studying! Review the material and try again."}
          </p>
          <Button onClick={handleRestart} variant="primary" size="sm" className="mt-2">
            Restart Quiz
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
        <span>{title}</span>
        <span>Question {current + 1} of {total}</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      <Card>
        <h3 className="text-base font-semibold mb-4">{q.question}</h3>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, idx) => {
            let cls = "w-full text-left text-sm px-4 py-3 rounded-lg border transition-colors cursor-pointer ";
            if (!answered) {
              cls += "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border-hover)]";
            } else if (idx === q.correctIndex) {
              cls += "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success-fg)]";
            } else if (idx === selected) {
              cls += "border-[var(--error)] bg-[var(--error)]/10 text-[var(--error-fg)]";
            } else {
              cls += "border-[var(--border)] opacity-50";
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)} className={cls} disabled={answered}>
                <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-4 text-sm text-[var(--fg-secondary)] p-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--border)]">
            {q.explanation}
          </div>
        )}
      </Card>
      {answered && (
        <Button onClick={handleNext} variant="primary" size="sm" className="self-end">
          {current + 1 < total ? "Next Question" : "See Results"}
        </Button>
      )}
    </div>
  );
}
