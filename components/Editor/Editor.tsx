'use client';
import React, { useEffect } from 'react';
import { useEditorStore } from '@/lib/store';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ChatInterface } from '@/components/ChatInterface';
import { Mockup } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Play, Save, ChevronLeft } from 'lucide-react';
import { Link } from '@/components/Link';

interface EditorProps {
    initialMockup: Mockup;
}

export const Editor: React.FC<EditorProps> = ({ initialMockup }) => {
    const { currentMockup, setMockup, isDirty, saveMockup } = useEditorStore();
    const [saving, setSaving] = React.useState(false);

    useEffect(() => {
        setMockup(initialMockup);
    }, [initialMockup, setMockup]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveMockup();
        } catch (e) {
            // Error handled in store
        } finally {
            setSaving(false);
        }
    };

    if (!currentMockup) return <div>Loading editor...</div>;

    return (
        <div className="flex h-screen flex-col bg-[#F1F5F9] overflow-hidden">
            {/* Top Bar */}
            <header className="h-14 glass border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                    <div className="flex flex-col">
                        <h1 className="font-bold text-sm text-slate-900 leading-none mb-1">{currentMockup.name}</h1>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDirty ? 'text-amber-600' : 'text-slate-400'}`}>
                                {isDirty ? 'Unsaved Changes' : 'All Changes Saved'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/m/${currentMockup.id}`, '_blank')} className="text-slate-600 border-slate-200 bg-white">
                        <Play size={14} className="mr-2 text-indigo-500 fill-indigo-500" /> Preview
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className={`${isDirty ? 'bg-indigo-600 hover:bg-indigo-700 h-9' : 'bg-slate-900 hover:bg-slate-800'} shadow-lg shadow-indigo-100 transition-all`}
                    >
                        <Save size={14} className="mr-2" /> {saving ? 'Syncing...' : isDirty ? 'Publish & Save' : 'Published'}
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Steps */}
                <aside className="w-[300px] min-w-[300px] max-w-[300px] bg-white border-r border-slate-200/60 flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-40">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <LeftPanel />
                    </div>
                </aside>

                {/* Center: Canvas */}
                <main className="flex-1 bg-slate-100/50 relative flex justify-center items-center p-6 lg:p-12 overflow-hidden">
                    {/* Device Frame Wrapper */}
                    <div className="relative h-full w-full flex items-center justify-center animate-in zoom-in-95 duration-500 max-h-[85vh]">
                        {/* Apple iPhone 15 Pro Style Frame - Using robust aspect ratio with inline fallback for production stability */}
                        {/* Deployment Check: v2.1.2-stable */}
                        <div 
                            className="relative shadow-premium rounded-[48px] overflow-hidden border-[12px] border-slate-900 bg-black h-full aspect-phone ring-4 ring-slate-800/10 shrink-0"
                            style={{ aspectRatio: '9/19.5' }}
                        >
                            {/* Island / Notch */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-full z-30 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-800/50 ml-auto mr-4" />
                            </div>

                            <div className="w-full h-full relative">
                                <ChatInterface
                                    flow={currentMockup.flow}
                                    theme={currentMockup.theme}
                                    assets={currentMockup.assets}
                                    channel={currentMockup.channel}
                                    isPreview={true}
                                    liveMode={true}
                                    systemPrompt={currentMockup.prompt}
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Panel: Settings */}
                <aside className="w-[320px] min-w-[320px] max-w-[320px] bg-white border-l border-slate-200/60 flex flex-col shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] z-40">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <RightPanel />
                    </div>
                </aside>
            </div>
        </div>
    );
};
