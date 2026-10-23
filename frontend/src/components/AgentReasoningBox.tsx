'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export interface ReasoningStep {
  text: string;
  status: 'running' | 'done';
  timeMs?: number;
}

interface AgentReasoningBoxProps {
  steps: ReasoningStep[];
  isStreaming: boolean;
  elapsedSeconds?: number;
}

export function AgentReasoningBox({
  steps,
  isStreaming,
  elapsedSeconds = 2
}: AgentReasoningBoxProps) {
  // Start expanded if currently streaming so user sees live activity, or collapsed if done
  const [isExpanded, setIsExpanded] = useState<boolean>(isStreaming);

  if (!steps || steps.length === 0) return null;

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === 'done').length;

  return (
    <div className="w-full my-2.5 rounded-2xl border border-[#e8e6df] dark:border-[#263346] bg-white/70 dark:bg-[#18202c]/70 backdrop-blur-sm overflow-hidden text-xs transition-all shadow-xs">
      {/* Header bar - similar to ChatGPT's "Worked for X" */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer text-slate-600 dark:text-slate-300 select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>در حال پیگیری و بررسی هوشمند...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                روند بررسی دستیار ({totalSteps.toLocaleString('fa-IR')} مرحله در {Math.max(1, elapsedSeconds).toLocaleString('fa-IR')} ثانیه)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
          <span>{isExpanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded list of steps */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-[#f0eee6] dark:border-[#212c3d] space-y-2 animate-fade-in">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-black/[0.015] dark:bg-white/[0.015]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {step.status === 'running' ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
                <span className="truncate text-slate-700 dark:text-slate-300 text-[11.5px]">
                  {step.text}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                {step.status === 'running' ? 'در جریان' : 'انجام شد'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
