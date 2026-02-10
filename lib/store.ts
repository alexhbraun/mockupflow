import { create } from 'zustand';
import { Step, MockupTheme, MockupAssets, ChannelType, Mockup } from './types';
import { nanoid } from 'nanoid';

interface EditorState {
    currentMockup: Mockup | null;
    selectedStepIndex: number | null;
    isDirty: boolean;
    isGenerating: boolean;

    // Actions
    setMockup: (mockup: Mockup) => void;
    updateTheme: (theme: Partial<MockupTheme>) => void;
    updateAssets: (assets: Partial<MockupAssets>) => void;
    updatePrompt: (prompt: string) => void;
    updateIdid: (idid: string) => void;
    addStep: (step: Omit<Step, 'id'>) => void;
    updateStep: (index: number, step: Partial<Step>) => void;
    deleteStep: (index: number) => void;
    moveStep: (fromIndex: number, toIndex: number) => void;
    setSelectedStep: (index: number | null) => void;
    generateFlowFromPrompt: () => Promise<void>;
    saveMockup: () => Promise<void>;
}

const defaultTheme: MockupTheme = {
    primaryColor: '#0084ff',
    headerTextColor: '#ffffff',
    chatTitle: 'ChatBot',
    iconColor: '#0084ff',
};

const defaultAssets: MockupAssets = {
    avatarUrl: '',
    backgroundUrl: '',
};

export const useEditorStore = create<EditorState>((set, get) => ({
    currentMockup: null,
    selectedStepIndex: null,
    isDirty: false,
    isGenerating: false,

    setMockup: (mockup) => set({ currentMockup: mockup, isDirty: false, selectedStepIndex: null }),

    updateTheme: (theme) => set((state) => ({
        currentMockup: state.currentMockup ? {
            ...state.currentMockup,
            theme: { ...state.currentMockup.theme, ...theme }
        } : null,
        isDirty: true
    })),

    updateAssets: (assets) => set((state) => ({
        currentMockup: state.currentMockup ? {
            ...state.currentMockup,
            assets: { ...state.currentMockup.assets, ...assets }
        } : null,
        isDirty: true
    })),

    addStep: (step) => set((state) => {
        if (!state.currentMockup) return {};
        const newStep = { ...step, id: nanoid() };
        return {
            currentMockup: {
                ...state.currentMockup,
                flow: [...state.currentMockup.flow, newStep]
            },
            isDirty: true,
            selectedStepIndex: state.currentMockup.flow.length // Select the new step
        };
    }),

    updateStep: (index, stepUpdate) => set((state) => {
        if (!state.currentMockup) return {};
        const newFlow = [...state.currentMockup.flow];
        if (index >= 0 && index < newFlow.length) {
            newFlow[index] = { ...newFlow[index], ...stepUpdate };
        }
        return {
            currentMockup: { ...state.currentMockup, flow: newFlow },
            isDirty: true
        };
    }),

    deleteStep: (index) => set((state) => {
        if (!state.currentMockup) return {};
        return {
            currentMockup: {
                ...state.currentMockup,
                flow: state.currentMockup.flow.filter((_, i) => i !== index)
            },
            isDirty: true,
            selectedStepIndex: null
        };
    }),

    moveStep: (fromIndex, toIndex) => set((state) => {
        if (!state.currentMockup) return {};
        const newFlow = [...state.currentMockup.flow];
        const [moved] = newFlow.splice(fromIndex, 1);
        newFlow.splice(toIndex, 0, moved);
        return {
            currentMockup: { ...state.currentMockup, flow: newFlow },
            isDirty: true,
            selectedStepIndex: toIndex
        };
    }),

    setSelectedStep: (index) => set({ selectedStepIndex: index }),

    updatePrompt: (prompt) => set((state) => ({
        currentMockup: state.currentMockup ? {
            ...state.currentMockup,
            prompt
        } : null,
        isDirty: true
    })),
    updateIdid: (idid) => set((state) => ({
        currentMockup: state.currentMockup ? {
            ...state.currentMockup,
            idid
        } : null,
        isDirty: true
    })),

    generateFlowFromPrompt: async () => {
        const state = get();
        if (!state.currentMockup?.prompt) {
            alert('Please enter a prompt describing your chatbot');
            return;
        }

        set({ isGenerating: true });

        try {
            const response = await fetch('/api/ai/generateFlow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: state.currentMockup.prompt })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate flow');
            }

            const { flow } = await response.json();

            set((state) => ({
                currentMockup: state.currentMockup ? {
                    ...state.currentMockup,
                    flow
                } : null,
                isDirty: true,
                isGenerating: false,
                selectedStepIndex: null
            }));
        } catch (error: any) {
            console.error('Flow generation error:', error);
            alert(`Failed to generate flow: ${error?.message || 'Unknown error'}\n\nPlease check:\n1. Your OPENAI_API_KEY is set in .env.local\n2. Your prompt is clear and specific\n3. The console for detailed errors`);
            set({ isGenerating: false });
        }
    },

    saveMockup: async () => {
        const state = get();
        if (!state.currentMockup || !state.currentMockup.id) return;

        const saveTimeout = 10000; // 10s timeout for saving

        try {
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('./firebase');

            if (!db) {
                throw new Error("Firestore not initialized. Check your environment variables.");
            }

            // Use setDoc with merge: true to create the doc if it doesn't exist
            const updatePromise = setDoc(doc(db, 'mockups', state.currentMockup.id), {
                ...state.currentMockup,
                updatedAt: serverTimestamp()
            }, { merge: true });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save operation timed out')), saveTimeout)
            );

            await Promise.race([updatePromise, timeoutPromise]);

            set({ isDirty: false });
            console.log("Mockup saved successfully");
        } catch (e: any) {
            console.error("Save failed:", e);
            if (e.message === 'Save operation timed out') {
                alert("Saving is taking too long. Your changes are saved locally, but might not be synced to the cloud yet. Please check your internet connection.");
            } else {
                alert(`Failed to save changes: ${e.message || 'Unknown error'}`);
            }
            throw e;
        }
    },
}));
