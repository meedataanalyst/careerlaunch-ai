import React from 'react';
import { ArrowRight, X, Check } from 'lucide-react';

interface GuideOverlayProps {
  step: number;
  onNext: () => void;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Welcome to CareerLaunch AI",
    description: "Let's get you ready for your next role. This tool optimizes your resume and finds matching jobs. Click 'Start' for a quick tour.",
    position: "center"
  },
  {
    title: "Step 1: Your Resume",
    description: "Start here. Paste your current resume text or Upload a PDF. We extract your skills and experience to use as a baseline.",
    position: "left"
  },
  {
    title: "Step 2: Target Job",
    description: "Tell us what you want. Paste the Job Description text or a direct link to the posting. We will tailor your resume to match this role perfectly.",
    position: "right"
  },
  {
    title: "Step 3: Location",
    description: "Crucial! Select your Country and State. We use this to filter out international spam and find jobs strictly in your area.",
    position: "right-center"
  },
  {
    title: "Step 4: Launch",
    description: "Click this button to start the magic. We will rewrite your resume with professional formatting AND find 5 active job listings that match it.",
    position: "bottom"
  }
];

const GuideOverlay: React.FC<GuideOverlayProps> = ({ step, onNext, onClose }) => {
  if (step === 0) return null; // Should not happen if controlled properly, but safety check

  const currentStepData = STEPS[step - 1];
  const isLastStep = step === STEPS.length;

  // Position logic for the text box
  let positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"; // Default center
  
  if (window.innerWidth >= 1024) { // Desktop positioning
      if (currentStepData.position === 'left') positionClasses = "top-1/3 left-1/4 -translate-x-1/2";
      if (currentStepData.position === 'right') positionClasses = "top-1/3 right-1/4 translate-x-1/2";
      if (currentStepData.position === 'right-center') positionClasses = "top-1/2 right-1/4 translate-x-1/2";
      if (currentStepData.position === 'bottom') positionClasses = "bottom-24 left-1/2 -translate-x-1/2";
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className={`absolute ${positionClasses} w-[90%] max-w-md p-1 pointer-events-none transition-all duration-500 ease-in-out`}>
        <div className="bg-slate-900 border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 rounded-2xl p-6 pointer-events-auto relative overflow-hidden">
            
            {/* Decorative Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/50 px-2 py-1 rounded border border-indigo-900">
                        Step {step} of {STEPS.length}
                    </span>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{currentStepData.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {currentStepData.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {STEPS.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-2 h-2 rounded-full transition-all ${idx + 1 === step ? 'bg-indigo-500 w-4' : 'bg-slate-700'}`}
                            ></div>
                        ))}
                    </div>
                    <button 
                        onClick={onNext}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/25"
                    >
                        {isLastStep ? (
                            <>
                                Got it
                                <Check className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GuideOverlay;
