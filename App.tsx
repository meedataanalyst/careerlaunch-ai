import React, { useState, useEffect } from 'react';
import ResumeForm from './components/ResumeForm';
import ResumeResult from './components/ResumeResult';
import GuideOverlay from './components/GuideOverlay';
import { UserInput, OptimizationResult, JobSearchResponse, AppState } from './types';
import { optimizeResume, findMatchingJobs } from './services/geminiService';
import { Rocket, Sparkles, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState(0);
  const [tourStep, setTourStep] = useState(0); // 0 = off, 1-5 = steps
  const [userInput, setUserInput] = useState<UserInput>({
    resumeText: '',
    jobDescription: '',
    jobDescriptionType: 'text',
    tone: 'Professional',
    location: '',
    country: '',
    state: ''
  });
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [searchResult, setSearchResult] = useState<JobSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    setAppState(AppState.GENERATING);
    setOptimizationResult(null);
    setSearchResult(null);
    setError(null);
    setProgress(1);

    // Phase 1 Timer: Optimization (0 -> 45%)
    const phase1Timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 45) return 45; // Stall at 45% until API returns
        return prev + 1;
      });
    }, 100);

    let phase2Timer: any = null;

    try {
      // Step 1: Optimize Resume
      const optData = await optimizeResume(userInput);
      
      clearInterval(phase1Timer);
      setProgress(50); // Jump to 50%
      setOptimizationResult(optData);
      
      // Step 2: Switch to Job Search state
      setAppState(AppState.SEARCHING);
      
      // Phase 2 Timer: Job Search (50 -> 90%)
      phase2Timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Stall at 90% until API returns
          return prev + 1;
        });
      }, 150);
      
      // Step 3: Find Matching Jobs
      const jobData = await findMatchingJobs(optData.revisedResume, userInput.location);
      
      clearInterval(phase2Timer);
      setProgress(100);
      setSearchResult(jobData);
      
      // Short delay to show 100%
      setTimeout(() => {
        setAppState(AppState.COMPLETE);
      }, 500);

    } catch (err: any) {
      clearInterval(phase1Timer);
      if (phase2Timer) clearInterval(phase2Timer);
      console.error(err);
      setError("Failed to process request. Please check your API key or try again later.");
      setAppState(AppState.ERROR);
    }
  };

  const resetProcess = () => {
    setAppState(AppState.IDLE);
    setOptimizationResult(null);
    setSearchResult(null);
    setProgress(0);
  };

  const getLoadingStepLabel = () => {
    if (appState === AppState.GENERATING || appState === AppState.SEARCHING) {
        return "Loading...";
    }
    return "Processing...";
  };

  // Tour Handlers
  const startTour = () => setTourStep(1);
  const nextTourStep = () => {
    if (tourStep >= 5) { // 5 is currently the last step
      setTourStep(0);
    } else {
      setTourStep(prev => prev + 1);
    }
  };
  const closeTour = () => setTourStep(0);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 relative">
      
      {/* Guide Overlay */}
      {tourStep > 0 && (
        <GuideOverlay 
          step={tourStep} 
          onNext={nextTourStep} 
          onClose={closeTour} 
        />
      )}

      {/* Splash Screen Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-900 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          showSplash ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className={`flex flex-col items-center transition-all duration-1000 transform ${showSplash ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <div className="relative mb-6">
              <div className="absolute inset-0 bg-white blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="bg-white p-6 rounded-3xl shadow-2xl relative">
                <Rocket className="w-16 h-16 text-indigo-600 fill-indigo-100" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-bounce" />
           </div>
           
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3 text-center">
             CareerLaunch AI
           </h1>
           
           <div className="h-0.5 w-24 bg-white/30 rounded-full mb-4"></div>
           
           <p className="text-indigo-100 text-lg md:text-xl font-medium tracking-widest uppercase">
             Accelerate Your Future
           </p>
        </div>
      </div>

      {/* Compact Header - Dark Theme to match Logo */}
      <header className="bg-indigo-950 border-b border-indigo-900 h-14 flex-none z-50 shadow-md">
        <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2" role="button" onClick={resetProcess}>
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 rounded-md shadow-lg shadow-indigo-500/20">
               <Rocket className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight cursor-pointer">
              CareerLaunch AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {appState === AppState.ERROR && (
                <div className="text-xs text-red-200 font-medium bg-red-900/50 px-2 py-1 rounded border border-red-800">
                   {error}
                </div>
             )}
             
             {/* Help Button */}
             <button 
                onClick={startTour}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 hover:text-white rounded-full transition-all text-xs font-bold border border-indigo-700/50"
             >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guide</span>
             </button>

             <div className="text-[10px] font-bold text-indigo-200 bg-indigo-900/50 px-2 py-1 rounded uppercase tracking-wider border border-indigo-800 hidden sm:block">
               Gemini 2.5 Flash
             </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4 bg-slate-950">
        <div className="h-full max-w-screen-2xl mx-auto bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
          {(appState === AppState.IDLE || appState === AppState.GENERATING) ? (
             <ResumeForm 
               input={userInput} 
               onChange={setUserInput} 
               onSubmit={handleSubmit}
               isLoading={appState === AppState.GENERATING}
               loadingStep={getLoadingStepLabel()}
               progress={progress}
               tourStep={tourStep}
             />
          ) : (
            <ResumeResult 
              result={optimizationResult!} 
              jobResult={searchResult}
              isSearchingJobs={appState === AppState.SEARCHING}
              progress={progress}
              onReset={resetProcess} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;