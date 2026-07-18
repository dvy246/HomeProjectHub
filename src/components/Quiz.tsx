import { useState, useCallback, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { useI18n } from "./i18n/I18nProvider";
import { withI18n } from "./i18n/withI18n";

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

function Quiz({ title, questions }: QuizProps) {
  const { t } = useI18n();
  const [shuffled, setShuffled] = useState<QuizQuestion[]>(() => questions.slice(0, 8));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setShuffled(shuffleArray(questions).slice(0, 8));
  }, [questions]);

  const total = shuffled.length;
  const q = shuffled[current];

  const handleSelect = useCallback((idx: number) => {
    if (answered || !q) return;
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
    const reshuffled = shuffleArray(questions).slice(0, 8);
    setShuffled(reshuffled);
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
          <h3 className="text-xl font-bold">{title} — {t('quiz.complete') ?? 'Complete!'}</h3>
          <div className="text-5xl font-black tabular-nums">{score}/{total}</div>
          <p className="text-sm text-[var(--fg-secondary)]">{t('quiz.percent_correct')?.replace('{pct}', String(pct)) ?? `${pct}% correct`}</p>
          <div className="w-full max-w-xs h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-[var(--fg-secondary)] text-pretty max-w-sm">
            {pct === 100 ? (t('quiz.perfect_score') ?? "Perfect score! You know your materials.") :
             pct >= 80 ? (t('quiz.great_job') ?? "Great job! You have a solid understanding.") :
             pct >= 60 ? (t('quiz.good_effort') ?? "Good effort! Review the explanations to improve.") :
             (t('quiz.keep_studying') ?? "Keep studying! Review the material and try again.")}
          </p>
          <Button onClick={handleRestart} variant="primary" size="sm" className="mt-2">
            {t('quiz.restart') ?? 'Restart Quiz'}
          </Button>
        </div>
      </Card>
    );
  }

  if (!q) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
        <span>{title}</span>
        <span>{t('quiz.question_of')?.replace('{n}', String(current + 1)).replace('{total}', String(total)) ?? `Question ${current + 1} of ${total}`}</span>
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
          {current + 1 < total ? (t('quiz.next_question') ?? "Next Question") : (t('quiz.see_results') ?? "See Results")}
        </Button>
      )}
    </div>
  );
}

export default withI18n(Quiz);
