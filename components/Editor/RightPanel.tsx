'use client';
import React, { useState } from 'react';
import { useEditorStore } from '@/lib/store';
import { nanoid } from 'nanoid';
import { Globe, Camera, UploadCloud, Monitor, Copy, Link, Code, Check, Save } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const RightPanel: React.FC = () => {
    const { currentMockup, updateTheme, updateAssets, selectedStepIndex, updateStep, setSelectedStep, isDirty, saveMockup } = useEditorStore();
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [idid, setIdid] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'avatarUrl' | 'backgroundUrl') => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        
        try {
            setUploading(true);
            
            if (!storage) {
                console.warn("Storage not initialized, switching to local mode");
                throw new Error("Storage service unavailable");
            }

            const storageRef = ref(storage, `uploads/${nanoid()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            updateAssets({ [key]: downloadURL });
        } catch (error) {
            console.error("Upload error due to missing Firebase config, using local preview:", error);
            // Fallback: Read as Data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                    updateAssets({ [key]: result });
                }
            };
            reader.readAsDataURL(file);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleCaptureUrl = () => {
        if (!currentMockup?.assets.backgroundUrl) return;
        const url = currentMockup.assets.backgroundUrl;
        
        // Basic validation for URL
        if (!url.startsWith('http')) {
            alert("Please enter a valid URL starting with http:// or https://");
            return;
        }

        // Use Microlink API for screenshot (Mobile Viewport + Full Page)
        const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot.fullPage=true&viewport.width=390&viewport.height=844&viewport.isMobile=true&viewport.deviceScaleFactor=3&meta=false&embed=screenshot.url`;
        updateAssets({ backgroundUrl: screenshotUrl });
    };

    const handleSaveLocal = async () => {
        setSaving(true);
        try {
            await saveMockup();
        } finally {
            setSaving(false);
        }
    };

    if (!currentMockup) return null;

    const selectedStep = selectedStepIndex !== null ? currentMockup.flow[selectedStepIndex] : null;

    // ... (rest of logic)

    const embedUrl = `${window.location.origin}/m/${currentMockup.id}${idid ? `?idid=${idid}` : ''}`;
    const embedCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="700px" 
  frameborder="0" 
  style="border:none; border-radius: 12px; overflow: hidden;"
></iframe>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Global Settings View
    return (
        <div className="flex flex-col h-full bg-white divide-y divide-slate-100">
            <div className="p-6 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight leading-none mb-1">Global Config</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Styles & Assets</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar pb-32">
                {/* Share & Embed */}
                <section className="space-y-5">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full" />
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Share & Embed</h3>
                    </div>

                    <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                        {isDirty && (
                            <button
                                onClick={handleSaveLocal}
                                disabled={saving}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={14} className={saving ? 'animate-spin' : ''} />
                                {saving ? 'Saving...' : 'Publish to Enable Embed'}
                            </button>
                        )}

                        <div className={`space-y-4 ${isDirty ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold text-purple-900/40 uppercase tracking-widest flex items-center justify-between">
                                    Affiliate / Ad ID (idid)
                                    <span className="text-[9px] font-bold text-purple-400">Optional Tracking</span>
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full p-3 pl-10 text-sm border border-purple-200 rounded-xl bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Enter ID for tracking..."
                                        value={idid}
                                        onChange={(e) => setIdid(e.target.value)}
                                    />
                                    <Link size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold text-purple-900/40 uppercase tracking-widest">Embed Code</label>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        className="w-full p-4 text-[11px] font-mono border border-purple-200 rounded-xl bg-white/80 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all h-24 resize-none leading-relaxed text-slate-600"
                                        value={embedCode}
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="absolute right-2 top-2 p-2 bg-white border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="space-y-5">
                    {/* ... existing Appearance code */}

                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Design System</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Interface Name</label>
                            <input
                                className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                value={currentMockup.theme.chatTitle}
                                onChange={(e) => updateTheme({ chatTitle: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Primary Brand Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="h-11 w-14 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                                    value={currentMockup.theme.primaryColor}
                                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="flex-1 p-3 text-sm font-mono font-bold border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all uppercase"
                                    value={currentMockup.theme.primaryColor}
                                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Assets */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Media Assets</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Avatar / Logo */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                Avatar / Logo
                                <span className="text-[9px] font-bold text-slate-300">Brand Identity</span>
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        className="w-full p-3 pl-10 text-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="https://..."
                                        value={currentMockup.assets.avatarUrl}
                                        onChange={(e) => updateAssets({ avatarUrl: e.target.value })}
                                    />
                                    <Camera size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                <label className={`cursor-pointer bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-4 flex items-center justify-center transition-all group ${uploading ? 'opacity-50' : ''}`}>
                                    <UploadCloud size={16} className="text-slate-400 group-hover:text-indigo-500" />
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'avatarUrl')} accept="image/*" disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        {/* Atmosphere Backdrop */}
                        <div className="flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                Atmosphere Backdrop
                                <span className="text-[9px] font-bold text-indigo-500">Target Site</span>
                            </label>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-1">Enter a website URL to auto-capture, or paste a direct image URL (.jpg, .png, etc.)</p>

                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        className="w-full p-3 pl-10 pr-24 text-sm border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="https://client.com or image URL"
                                        value={currentMockup.assets.backgroundUrl}
                                        onChange={(e) => updateAssets({ backgroundUrl: e.target.value })}
                                    />
                                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        onClick={handleCaptureUrl}
                                        className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5"
                                    >
                                        <Monitor size={10} />
                                        Capture
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-slate-100" />
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">OR</span>
                                    <div className="h-[1px] flex-1 bg-slate-100" />
                                </div>

                                <label className={`w-full cursor-pointer bg-white hover:bg-indigo-50/50 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl py-4 flex flex-col items-center justify-center gap-2 transition-all group ${uploading ? 'opacity-50' : ''}`}>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-white transition-all">
                                        <UploadCloud size={16} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">Upload Screenshot</span>
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'backgroundUrl')} accept="image/*" disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
