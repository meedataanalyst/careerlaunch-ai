import React, { useState, useRef } from 'react';
import { UserInput } from '../types';
import { FileText, Upload, X, Type, ArrowRight, Link as LinkIcon, Globe, Briefcase, MapPin } from 'lucide-react';

interface ResumeFormProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingStep: string;
  progress: number;
  tourStep?: number; // Added prop for tour highlighting
}

const LOCATION_DATA: Record<string, string[]> = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland", "London", "Manchester", "Birmingham", "Leeds", "Glasgow"
  ],
  "Australia": [
    "New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia", "Australian Capital Territory", "Northern Territory"
  ],
  "India": [
    "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
  ],
  "Germany": [
    "Bavaria", "Berlin", "Brandenburg", "Hamburg", "Hesse", "Lower Saxony", "North Rhine-Westphalia", "Saxony"
  ],
  "France": [
    "Île-de-France (Paris)", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Hauts-de-France", "Provence-Alpes-Côte d'Azur"
  ],
  "Singapore": ["Central Region", "East Region", "North Region", "North-East Region", "West Region"]
};

const ResumeForm: React.FC<ResumeFormProps> = ({ input, onChange, onSubmit, isLoading, loadingStep, progress, tourStep = 0 }) => {
  const [resumeInputMethod, setResumeInputMethod] = useState<'text' | 'file'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (field: keyof UserInput, value: any) => {
    onChange({ ...input, [field]: value });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    onChange({
      ...input,
      country: newCountry,
      state: '',
      location: newCountry // Fallback location
    });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    onChange({
      ...input,
      state: newState,
      location: `${newState}, ${input.country}`
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        onChange({
          ...input,
          resumeText: '',
          resumeFile: {
            data: base64String,
            mimeType: file.type,
            name: file.name
          }
        });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Please upload a PDF file.");
    }
  };

  const clearFile = () => {
    onChange({ ...input, resumeFile: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isResumePresent = input.resumeText.length > 20 || !!input.resumeFile;
  
  const isJobDescriptionPresent = 
    (input.jobDescriptionType === 'text' && input.jobDescription.length > 20) ||
    (input.jobDescriptionType === 'link' && input.jobDescriptionLink && input.jobDescriptionLink.length > 5);

  const isFormValid = isResumePresent && isJobDescriptionPresent && input.country;

  // Highlight helper
  const getHighlightClass = (stepMatch: number) => {
    return tourStep === stepMatch 
      ? 'ring-4 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-50 relative bg-slate-900 rounded-xl transition-all duration-300' 
      : 'transition-all duration-300';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Main Form Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* LEFT PANE: Resume Input */}
          <div className={`flex flex-col h-full min-h-[50%] lg:min-h-0 p-6 bg-slate-900/50 ${getHighlightClass(2)}`}>
            <div className="flex items-center justify-between mb-3 flex-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Your Resume
              </label>
              <div className="flex bg-slate-800 border border-slate-700 rounded-md p-0.5 shadow-sm">
                 <button onClick={() => setResumeInputMethod('text')} title="Paste Text" className={`px-3 py-1 text-xs font-medium rounded transition-all ${resumeInputMethod === 'text' ? 'bg-indigo-900/50 text-indigo-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                    Text
                 </button>
                 <button onClick={() => setResumeInputMethod('file')} title="Upload PDF" className={`px-3 py-1 text-xs font-medium rounded transition-all ${resumeInputMethod === 'file' ? 'bg-indigo-900/50 text-indigo-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                    Upload
                 </button>
              </div>
            </div>

            <div className="flex-1 relative group">
              {resumeInputMethod === 'text' ? (
                <textarea
                  className="w-full h-full p-4 text-sm bg-white text-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none font-mono leading-relaxed placeholder:text-slate-400"
                  placeholder="Paste your full resume text here..."
                  value={input.resumeText}
                  onChange={(e) => {
                    handleChange('resumeText', e.target.value);
                    handleChange('resumeFile', undefined);
                  }}
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 flex flex-col items-center justify-center p-6 text-center hover:bg-slate-800 hover:border-indigo-500/50 transition-all relative">
                  {input.resumeFile ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <div className="w-14 h-14 bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center mb-3">
                        <FileText className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-200">{input.resumeFile.name}</p>
                      <button 
                        onClick={clearFile}
                        className="mt-4 px-3 py-1.5 bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium rounded-full hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-3 h-3" />
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      <div className="w-12 h-12 bg-indigo-900/20 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">Drop PDF here</p>
                      <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Job Description */}
          <div className={`flex flex-col h-full min-h-[50%] lg:min-h-0 p-6 bg-slate-900 ${getHighlightClass(3)}`}>
            <div className="flex items-center justify-between mb-3 flex-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Target Job
              </label>
              
              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-800 rounded-md border border-slate-700 px-2 py-0.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tone</span>
                    <select 
                      value={input.tone}
                      onChange={(e) => handleChange('tone', e.target.value)}
                      className="bg-transparent text-xs font-medium text-slate-300 outline-none cursor-pointer hover:text-indigo-400 border-none focus:ring-0 py-0"
                    >
                      <option className="bg-slate-900">Professional</option>
                      <option className="bg-slate-900">Enthusiastic</option>
                      <option className="bg-slate-900">Concise</option>
                      <option className="bg-slate-900">Executive</option>
                    </select>
                  </div>
                  
                  <div className="flex bg-slate-800 border border-slate-700 rounded-md p-0.5 shadow-sm">
                     <button onClick={() => handleChange('jobDescriptionType', 'text')} title="Paste Text" className={`px-2 py-1 text-xs font-medium rounded transition-all ${input.jobDescriptionType === 'text' ? 'bg-indigo-900/50 text-indigo-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Type className="w-3.5 h-3.5" />
                     </button>
                     <button onClick={() => handleChange('jobDescriptionType', 'link')} title="Paste URL" className={`px-2 py-1 text-xs font-medium rounded transition-all ${input.jobDescriptionType === 'link' ? 'bg-indigo-900/50 text-indigo-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                        <LinkIcon className="w-3.5 h-3.5" />
                     </button>
                  </div>
              </div>
            </div>
            
            {/* Location Input: Country & State */}
            <div className={`flex-none mb-3 grid grid-cols-2 gap-3 p-1 rounded-lg ${tourStep === 4 ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-50 bg-slate-800' : ''}`}>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                <select
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white text-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  value={input.country}
                  onChange={handleCountryChange}
                >
                  <option value="">Select Country</option>
                  {Object.keys(LOCATION_DATA).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative group">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none ${input.country ? 'text-slate-400' : 'text-slate-300'}`} />
                <select
                  className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none transition-all shadow-sm appearance-none ${
                    input.country 
                    ? 'bg-white text-slate-900 border-slate-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer' 
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                  value={input.state}
                  onChange={handleStateChange}
                  disabled={!input.country}
                >
                  <option value="">Select State/Region</option>
                  {input.country && LOCATION_DATA[input.country]?.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 relative">
                {input.jobDescriptionType === 'text' ? (
                   <textarea
                    className="w-full h-full p-4 text-sm bg-white text-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none font-mono leading-relaxed placeholder:text-slate-400 shadow-sm"
                    placeholder="Paste the job description or requirements here..."
                    value={input.jobDescription}
                    onChange={(e) => handleChange('jobDescription', e.target.value)}
                  />
                ) : (
                  <div className="w-full h-full border border-slate-700 rounded-xl bg-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-sm">
                      <div className="relative z-10 w-full max-w-sm">
                        <div className="w-12 h-12 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 mb-2">Paste Job Link</h3>
                        <div className="relative">
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm text-slate-900"
                                value={input.jobDescriptionLink || ''}
                                onChange={(e) => handleChange('jobDescriptionLink', e.target.value)}
                            />
                            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className={`flex-none p-4 border-t border-slate-800 bg-slate-900 ${tourStep === 5 ? 'relative z-50 shadow-[0_-5px_30px_rgba(99,102,241,0.3)]' : ''}`}>
        <div className="max-w-md mx-auto">
          <button
            onClick={onSubmit}
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider shadow-md transition-all relative overflow-hidden ${
              !isFormValid || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/25 active:scale-[0.98]'
            } ${tourStep === 5 ? 'ring-4 ring-indigo-400 animate-pulse' : ''}`}
          >
            {isLoading ? (
               <div className="w-full relative z-10">
                   <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-indigo-200 px-1">
                       <span>{loadingStep}</span>
                       <span>{progress}%</span>
                   </div>
                   <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className="bg-indigo-400 h-full transition-all duration-300 ease-out" 
                         style={{ width: `${progress}%` }}
                       ></div>
                   </div>
               </div>
            ) : (
              <>
                Optimize & Find Jobs
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;