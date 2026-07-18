import React, { useState, useMemo } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { parseNumber } from "../../lib/helpers";
import { calculateRenovationLoan, type LoanType } from "../../lib/renovationLoanEngine";

function RenovationLoanCalc() {
  const { t } = useI18n();
  const [purchasePriceStr, setPurchasePriceStr] = useState("250000");
  const [renovationBudgetStr, setRenovationBudgetStr] = useState("45000");
  const [loanType, setLoanType] = useState<LoanType>("203k-standard");
  const [interestRateStr, setInterestRateStr] = useState("6.5");
  const [termYearsStr, setTermYearsStr] = useState("30");
  const [downPaymentPercentStr, setDownPaymentPercentStr] = useState("3.5");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  const results = useMemo(() => {
    return calculateRenovationLoan({
      purchasePrice: parseNumber(purchasePriceStr) || 0,
      renovationBudget: parseNumber(renovationBudgetStr) || 0,
      loanType,
      interestRate: parseNumber(interestRateStr) || 0,
      termYears: parseNumber(termYearsStr) || 30,
      downPaymentPercent: parseNumber(downPaymentPercentStr) || 0,
    });
  }, [purchasePriceStr, renovationBudgetStr, loanType, interestRateStr, termYearsStr, downPaymentPercentStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl mx-auto">
      <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
        <Card className="p-4 sm:p-6 flex flex-col gap-5">
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">
            Loan Configuration
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Home Purchase Price"
                type="number"
                value={purchasePriceStr}
                onChange={(e) => setPurchasePriceStr(e.target.value)}
                min="0"
                step="1000"
              />
              <Input
                label="Renovation Budget"
                type="number"
                value={renovationBudgetStr}
                onChange={(e) => setRenovationBudgetStr(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
            
            <Select
              label="Loan Program"
              value={loanType}
              onChange={(val) => setLoanType(val as LoanType)}
              options={[
                { value: "203k-standard", label: "FHA 203k Standard" },
                { value: "203k-limited", label: "FHA 203k Limited" },
                { value: "homestyle", label: "Fannie Mae HomeStyle" }
              ]}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Interest Rate (%)"
                type="number"
                value={interestRateStr}
                onChange={(e) => setInterestRateStr(e.target.value)}
                min="0"
                max="15"
                step="0.125"
              />
              <Input
                label="Term (Years)"
                type="number"
                value={termYearsStr}
                onChange={(e) => setTermYearsStr(e.target.value)}
                min="10"
                max="30"
                step="5"
              />
            </div>

            <div>
               <div className="flex justify-between mb-1">
                 <label className="text-sm font-medium text-[var(--fg)]">Down Payment (%)</label>
                 <span className="text-sm text-[var(--fg-secondary)]">{downPaymentPercentStr}%</span>
               </div>
               <input
                 type="range"
                 min="0"
                 max="20"
                 step="0.5"
                 value={downPaymentPercentStr}
                 onChange={(e) => setDownPaymentPercentStr(e.target.value)}
                 className="w-full accent-[var(--color-accent)] cursor-pointer"
               />
            </div>
            
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="mt-2 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Estimate
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="lg:col-span-7 flex flex-col gap-6">
        {results.warnings.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Warning</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc pl-5 space-y-1">
                    {results.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      
        <Card className="p-4 sm:p-6 bg-stone-50 dark:bg-stone-900/50">
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)] mb-6">
            Estimated Costs & Payment
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-[var(--border)]">
              <div className="text-sm text-[var(--fg-secondary)] mb-1">Total Loan Amount</div>
              <div className="text-2xl font-bold text-[var(--fg)]">{formatCurrency(results.totalLoanAmount)}</div>
            </div>
            <div className="p-4 bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-[var(--border)]">
              <div className="text-sm text-[var(--fg-secondary)] mb-1">Estimated Monthly PITI</div>
              <div className="text-2xl font-bold text-[var(--color-accent)]">{formatCurrency(results.monthlyPITI)}</div>
            </div>
          </div>
          
          <h3 className="text-md font-semibold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">
            Cost Breakdown
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--fg-secondary)]">Base Purchase Price</span>
              <span className="font-medium">{formatCurrency(results.breakdown.basePurchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-secondary)]">Renovation Budget</span>
              <span className="font-medium">{formatCurrency(results.breakdown.renoCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-secondary)]">Contingency Reserve</span>
              <span className="font-medium">{formatCurrency(results.breakdown.contingencyReserve)}</span>
            </div>
            {results.breakdown.fees > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--fg-secondary)]">HUD Consultant / Fees</span>
                <span className="font-medium">{formatCurrency(results.breakdown.fees)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 font-bold">
              <span>Total Estimated Cost</span>
              <span>{formatCurrency(results.breakdown.totalCost)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-accent)]">
              <span>Down Payment ({downPaymentPercentStr}%)</span>
              <span>-{formatCurrency(results.breakdown.totalCost * (parseNumber(downPaymentPercentStr) || 0) / 100)}</span>
            </div>
          </div>
          
          <h3 className="text-md font-semibold text-[var(--fg)] mt-6 mb-4 border-b border-[var(--border)] pb-2">
            Monthly Payment Estimate
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--fg-secondary)]">Principal & Interest</span>
              <span className="font-medium">{formatCurrency(results.baseMonthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-secondary)]">PMI (Estimated)</span>
              <span className="font-medium">{formatCurrency(results.pmiEstimate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-secondary)]">Taxes & Insurance (Estimated)</span>
              <span className="font-medium">{formatCurrency(results.monthlyPITI - results.baseMonthlyPayment - results.pmiEstimate)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(RenovationLoanCalc);
