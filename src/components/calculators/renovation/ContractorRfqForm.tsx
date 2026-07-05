import { useState } from "react";
import { Card } from "../../ui/Card";
import { Input } from "../../ui/Input";

interface RfqFormProps {
  projectType: string;
}

export default function ContractorRfqForm({ projectType }: RfqFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [timeframe, setTimeframe] = useState("1-3 months");
  const [notes, setNotes] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Valid email is required.";
    if (!phone.trim() || !/^\+?[0-9\s-()]{10,20}$/.test(phone)) newErrors.phone = "Valid phone number is required.";
    if (!zip.trim() || zip.length < 5) newErrors.zip = "ZIP code is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Mock API submission simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-xl mx-auto text-center p-8 border-[var(--success)]/30 bg-[var(--bg-subtle)]">
        <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[var(--fg)] mb-2">Quote Request Submitted!</h3>
        <p className="text-xs text-[var(--fg-secondary)] max-w-sm mx-auto leading-relaxed">
          We have received your estimate parameters. We are matching your project dimensions for <strong>{projectType}</strong> in ZIP <strong>{zip}</strong> with up to three licensed, vetted local contractors. They will reach out shortly for a free site consult.
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto border border-[var(--border)] bg-[var(--card-bg)] shadow-md">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[var(--fg)] mb-1">Get Free Local Contractor Quotes</h3>
        <p className="text-xs text-[var(--fg-secondary)]">
          Compare pricing from up to 3 certified pros in your area. Enter your contact info to sync your dimensions and request quotes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              error={errors.name}
            />
          </div>
          <div>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              error={errors.email}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (555) 123-4567"
              error={errors.phone}
            />
          </div>
          <div>
            <Input
              label="ZIP Code"
              type="text"
              value={zip}
              maxLength={6}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 90210"
              error={errors.zip}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-secondary)] mb-1.5">Project Timeframe</label>
            <div className="grid grid-cols-3 gap-2">
              {["Immediately", "1-3 months", "3+ months"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    timeframe === t
                      ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]"
                      : "border-[var(--border)] bg-transparent text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="rfq-notes" className="block text-xs font-semibold text-[var(--fg-secondary)] mb-1.5">Project Details (Optional)</label>
          <textarea
            id="rfq-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe any special requirements, grades of materials, or access limitations..."
            className="w-full min-h-[70px] p-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-2.5 px-4 text-xs font-bold rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Matching with local pros...</span>
            </div>
          ) : (
            "Request Free Quotes"
          )}
        </button>
      </form>
    </Card>
  );
}
