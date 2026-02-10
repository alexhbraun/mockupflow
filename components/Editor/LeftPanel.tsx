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
            <div className="p-6 border-b border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    <h2 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest">Magic Generate</h2>
                </div>
                <p className="text-[10px] text-slate-600 mb-3 leading-relaxed">Paste your complete system prompt that defines the bot's personality, behavior, and conversation flow.</p>
                <textarea
                    className="w-full p-3 text-sm border border-indigo-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none font-mono"
                    placeholder="Paste your system prompt here...&#10;&#10;Example:&#10;You are a helpful customer service bot for [Business Name].&#10;Your goal is to:&#10;- Greet visitors warmly&#10;- Ask for their name&#10;- Collect their email&#10;- Ask about their needs&#10;- Provide helpful information"
                    rows={8}
                    value={currentMockup.prompt || ''}
                    onChange={(e) => updatePrompt(e.target.value)}
                />
                <Button
                    onClick={generateFlowFromPrompt}
                    disabled={isGenerating || !currentMockup.prompt}
                    className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
                    isLoading={isGenerating}
                >
                    <Sparkles size={14} />
                    {isGenerating ? 'Generating Flow...' : 'Generate Flow from Prompt'}
                </Button>
            </div>

            <div className="p-6 border-b border-slate-100 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Sequence</h2>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-100">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Live AI Active
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                            {currentMockup.flow.length} STAGES
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Construct Flow</p>
                        <p className="text-[9px] text-slate-500 leading-tight">The list below is for manual recording. Your preview is currently **100% driven by GPT-4o** using the prompt above.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAddStep('BOT_MESSAGE')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                            <MessageCircle size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-slate-600">Bot Message</span>
                        </button>
                        <button onClick={() => handleAddStep('USER_MESSAGE')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                            <User size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-slate-600">User Message</span>
                        </button>
                        <button onClick={() => handleAddStep('INPUT_CAPTURE')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all group">
                            <GripVertical size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-slate-600">Input Data</span>
                        </button>
                        <button onClick={() => handleAddStep('QUICK_REPLIES')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all group">
                            <Plus size={18} className="text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-slate-600">Quick Options</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {currentMockup.flow.map((step, index) => (
                    <div
                        key={step.id}
                        onClick={() => setSelectedStep(index)}
                        className={`
                            relative group p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                            ${selectedStepIndex === index
                                ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex flex-col items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${step.type === 'BOT_MESSAGE' ? 'bg-indigo-500' :
                                    step.type === 'USER_MESSAGE' ? 'bg-emerald-500' :
                                        step.type === 'INPUT_CAPTURE' ? 'bg-amber-500' : 'bg-purple-500'
                                    }`} />
                                <div className="w-[1px] h-8 bg-slate-100" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                        Stage {index + 1}
                                    </span>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveStep(index, index - 1); }}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                        >
                                            <ArrowUp size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveStep(index, index + 1); }}
                                            disabled={index === currentMockup.flow.length - 1}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                        >
                                            <ArrowDown size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteStep(index); }}
                                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {step.type === 'BOT_MESSAGE' ? 'Bot: ' : step.type === 'USER_MESSAGE' ? 'User: ' : 'Capture: '}
                                    <span className="font-normal text-slate-600">
                                        {step.text || step.prompt || '(Empty)'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {currentMockup.flow.length === 0 && (
                    <div className="text-center py-20 px-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Plus size={24} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">No stages defined</p>
                        <p className="text-xs text-slate-400 mt-1">Add your first step to build the conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
