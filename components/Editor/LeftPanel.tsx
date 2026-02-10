'use client';
import React from 'react';
import { useEditorStore } from '@/lib/store';
import { Step } from '@/lib/types';
import { Plus, MessageCircle, User, GripVertical, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LeftPanel: React.FC = () => {
    const { currentMockup, addStep, deleteStep, moveStep, selectedStepIndex, setSelectedStep, updatePrompt, generateFlowFromPrompt, isGenerating } = useEditorStore();


    if (!currentMockup) return null;

    const handleAddStep = (type: Step['type']) => {
        addStep({
            type,
            text: type === 'BOT_MESSAGE' ? 'Hello! How can I help?' : 'I need more info.',
            delayMs: 1000,
        });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Magic Generate Section */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-600" />
                        <h2 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest">Magic Generate</h2>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold border border-green-100 uppercase tracking-tight">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live AI Driver Active
                    </span>
                </div>

                <div className="flex-1 flex flex-col space-y-3 min-h-0">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-indigo-900/40 uppercase tracking-widest">System Instructions</label>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Define the core personality and logic. The AI will follow these rules to drive the entire conversation.</p>
                    </div>

                    <textarea
                        className="flex-1 w-full p-4 text-sm border border-indigo-200 rounded-2xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none font-mono leading-relaxed"
                        placeholder="You are a helpful assistant for..."
                        value={currentMockup.prompt || ''}
                        onChange={(e) => updatePrompt(e.target.value)}
                    />

                    <Button
                        onClick={generateFlowFromPrompt}
                        disabled={isGenerating || !currentMockup.prompt}
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl"
                        isLoading={isGenerating}
                    >
                        <Sparkles size={14} />
                        {isGenerating ? 'Tuning AI Model...' : 'Apply & Test Logic'}
                    </Button>
                </div>
            </div>

            {/* Hint Section */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <MessageCircle size={14} className="text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-900 leading-none">Auto-Sync Enabled</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">Your preview is 100% driven by the GPT-4o engine using the instructions above.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
