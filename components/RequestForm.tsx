"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { RequestItem, STATUS, TIERS, TYPES, Priority } from "@/types/request";
import { priorityFromTier } from "@/lib/stats";
import { FiAlertCircle, FiCheckCircle, FiPlus } from "react-icons/fi";

type FormErrors = {
  patreonName?: string;
  characterName?: string;
  tier?: string;
};

type Props = { 
  onAdd: (item: RequestItem) => Promise<void> | void;
  className?: string;
};

export default function RequestForm({ onAdd, className = "" }: Props) {
  const [formData, setFormData] = useState({
    patreonName: "",
    tier: "Basic" as (typeof TIERS)[number],
    characterName: "",
    origin: "",
    requestType: "Portrait" as (typeof TYPES)[number],
    status: "Pending" as (typeof STATUS)[number],
    notes: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const priority = useMemo(() => priorityFromTier(formData.tier) as any, [formData.tier]);

  // Auto-focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.patreonName.trim()) {
      newErrors.patreonName = "Patreon name is required";
    }
    
    if (!formData.characterName.trim()) {
      newErrors.characterName = "Character name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      const newItem: RequestItem = {
        id: nanoid(),
        patreonName: formData.patreonName.trim(),
        tier: formData.tier,
        characterName: formData.characterName.trim(),
        origin: formData.origin.trim(),
        requestType: formData.requestType,
        status: formData.status,
        priority,
        dateRequested: new Date().toISOString(),
        revisionCount: 0,
        notes: formData.notes,
      };
      
      await onAdd(newItem);
      
      // Reset form
      setFormData({
        patreonName: "",
        tier: "Basic",
        characterName: "",
        origin: "",
        requestType: "Portrait",
        status: "Pending",
        notes: "",
      });
      
      setSubmitSuccess(true);
      firstInputRef.current?.focus();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to add request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patreonName: "",
      tier: "Basic",
      characterName: "",
      origin: "",
      requestType: "Portrait",
      status: "Pending",
      notes: "",
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  return (
    <div className={`rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${className}`}>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Patreon Name */}
          <div className="space-y-1">
            <label htmlFor="patreonName" className="text-xs font-semibold uppercase text-slate-500 ml-1 flex items-center">
              Patreon Name <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                id="patreonName"
                ref={firstInputRef}
                className={`w-full rounded-xl border ${
                  errors.patreonName ? 'border-red-300' : 'border-slate-200'
                } bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
                placeholder="Enter patron name"
                value={formData.patreonName}
                onChange={(e) => handleChange('patreonName', e.target.value)}
                aria-invalid={!!errors.patreonName}
                aria-describedby={errors.patreonName ? 'patreonName-error' : undefined}
              />
              {errors.patreonName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <FiAlertCircle className="h-5 w-5" />
                </div>
              )}
            </div>
            {errors.patreonName && (
              <p id="patreonName-error" className="mt-1 text-xs text-red-500">
                {errors.patreonName}
              </p>
            )}
          </div>

          {/* Character Name */}
          <div className="space-y-1">
            <label htmlFor="characterName" className="text-xs font-semibold uppercase text-slate-500 ml-1 flex items-center">
              Character Name <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                id="characterName"
                className={`w-full rounded-xl border ${
                  errors.characterName ? 'border-red-300' : 'border-slate-200'
                } bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
                placeholder="Enter character name"
                value={formData.characterName}
                onChange={(e) => handleChange('characterName', e.target.value)}
                aria-invalid={!!errors.characterName}
                aria-describedby={errors.characterName ? 'characterName-error' : undefined}
              />
              {errors.characterName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <FiAlertCircle className="h-5 w-5" />
                </div>
              )}
            </div>
            {errors.characterName && (
              <p id="characterName-error" className="mt-1 text-xs text-red-500">
                {errors.characterName}
              </p>
            )}
          </div>

          {/* Origin */}
          <div className="space-y-1">
            <label htmlFor="origin" className="text-xs font-semibold uppercase text-slate-500 ml-1">
              Origin (Optional)
            </label>
            <input
              id="origin"
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="Enter origin (optional)"
              value={formData.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
            />
          </div>

          {/* Tier */}
          <div className="space-y-1">
            <label htmlFor="tier" className="text-xs font-semibold uppercase text-slate-500 ml-1">
              Tier
            </label>
            <div className="relative">
              <select
                id="tier"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                value={formData.tier}
                onChange={(e) => handleChange('tier', e.target.value)}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Request Type */}
          <div className="space-y-1">
            <label htmlFor="requestType" className="text-xs font-semibold uppercase text-slate-500 ml-1">
              Type
            </label>
            <div className="relative">
              <select
                id="requestType"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                value={formData.requestType}
                onChange={(e) => handleChange('requestType', e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label htmlFor="status" className="text-xs font-semibold uppercase text-slate-500 ml-1">
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Priority (readonly) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500 ml-1">
              Priority
            </label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500 focus:outline-none cursor-not-allowed"
                value={priority}
                readOnly
                aria-label="Priority (automatically calculated based on tier)"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label htmlFor="notes" className="text-xs font-semibold uppercase text-slate-500 ml-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            rows={3}
            placeholder="Add notes (optional)"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <FiPlus className="h-4 w-4" />
                <span>Add Request</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Clear Form
          </button>

          {submitSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
              <FiCheckCircle className="h-5 w-5" />
              <span>Request added successfully!</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
