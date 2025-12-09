import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { OptimizationResult, JobSearchResponse } from '../types';
import { CheckCircle2, AlertCircle, TrendingUp, Copy, ArrowLeft, Download, FileText, Briefcase, ExternalLink, Loader2 } from 'lucide-react';

interface ResumeResultProps {
  result: OptimizationResult;
  jobResult: JobSearchResponse | null;
  isSearchingJobs: boolean;
  progress: number;
  onReset: () => void;
}

const ResumeResult: React.FC<ResumeResultProps> = ({ result, jobResult, isSearchingJobs, progress, onReset }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'jobs'>('preview');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    let textToCopy = "";
    if (activeTab === 'preview') {
        textToCopy = result.revisedResume;
    } else if (activeTab === 'jobs' && jobResult) {
        textToCopy = jobResult.text;
    }
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // We access html2pdf from window since it's loaded via CDN
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
        alert("PDF generator not ready. Please try again in a moment.");
        setIsDownloading(false);
        return;
    }

    let elementId = "";
    let filename = "";
    let opt = {};

    if (activeTab === 'preview') {
        elementId = "resume-preview-container";
        filename = "Optimized-Resume.pdf";
        opt = {
            margin: [10, 10, 10, 10], // mm
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
    } else {
        elementId = "jobs-preview-container";
        filename = "Matched-Jobs.pdf";
        opt = {
            margin: [10, 10, 10, 10], // mm
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
    }

    const element = document.getElementById(elementId);
    if (element) {
        try {
            await html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error("PDF generation failed", e);
            alert("Failed to generate PDF.");
        }
    }

    setIsDownloading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header (Hidden in Print) */}
      <div className="flex-none px-4 py-3 border-b border-indigo-100 flex items-center justify-between bg-indigo-50/30 print:hidden">
        <button 
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Editor
        </button>

        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Resume
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'jobs' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {isSearchingJobs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
            Jobs
          </button>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={handleDownload}
                disabled={isDownloading || (activeTab === 'jobs' && !jobResult)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Download PDF`}
            >
                {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button 
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Copy to Clipboard"
            >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 print:bg-white print:overflow-visible">
        {activeTab === 'preview' ? (
           <div className="flex flex-col lg:flex-row h-full print:block">
               {/* Resume Preview */}
               <div className="flex-1 p-8 lg:p-12 bg-white shadow-sm border-r border-slate-100 overflow-y-auto print:border-none print:shadow-none print:p-0 print:overflow-visible">
                   {/* This ID is targeted by html2pdf */}
                   <div id="resume-preview-container" className="max-w-[210mm] mx-auto print:max-w-none bg-white text-slate-900">
                     <ReactMarkdown 
                        className="font-serif text-slate-900"
                        components={{
                            // Strict formatting as requested: BOLD, CAPS, NEW LINE AFTER
                            h1: ({node, ...props}) => <h1 className="text-3xl font-black uppercase text-center text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-wide" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold uppercase text-slate-900 mt-12 mb-6 pb-2 border-b border-slate-200 tracking-wider" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-900 text-sm md:text-base text-justify" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-2 text-slate-900" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1 leading-relaxed text-sm md:text-base text-slate-900" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-slate-950" {...props} />,
                        }}
                     >
                        {result.revisedResume}
                     </ReactMarkdown>
                   </div>
               </div>
               
               {/* Analysis Sidebar */}
               <div className="w-full lg:w-80 p-6 bg-slate-50 overflow-y-auto space-y-6 border-t lg:border-t-0 print:hidden">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Match Score</div>
                        <div className="text-3xl font-black text-violet-600">{result.matchScore}%</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                            Summary
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{result.summary}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Improvements
                        </h3>
                        <ul className="space-y-2">
                            {result.keyImprovements.map((item, idx) => (
                                <li key={idx} className="text-xs text-slate-600 flex gap-2">
                                    <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Missing
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {result.missingKeywords.map((keyword, idx) => (
                                <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-semibold">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
               </div>
           </div>
        ) : (
          <div className="p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
             {isSearchingJobs ? (
                 <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Loading...</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-2 mb-4">
                        We are scanning active listings that match your newly optimized resume.
                    </p>
                    {/* Progress Bar for Job Search */}
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                            <span>Loading...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-violet-600 h-full transition-all duration-300 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                 </div>
             ) : jobResult ? (
                 // This ID is targeted by html2pdf
                 <div id="jobs-preview-container" className="space-y-6 bg-white p-4">
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 text-slate-900">
                        <div className="prose prose-slate prose-sm max-w-none text-slate-900 prose-headings:text-slate-900 prose-headings:uppercase prose-headings:font-bold prose-p:text-slate-800 prose-strong:text-slate-900 prose-li:text-slate-800 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-hr:my-6 print:prose-a:no-underline print:prose-a:text-black">
                            <ReactMarkdown>{jobResult.text}</ReactMarkdown>
                        </div>
                    </div>

                    {jobResult.groundingChunks && jobResult.groundingChunks.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-t print:border-slate-300 print:shadow-none print:p-0 print:pt-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 print:text-black">
                                Verified Job Links
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:block print:space-y-2">
                                {jobResult.groundingChunks.map((chunk, idx) => {
                                    const web = chunk.web;
                                    if (!web) return null;
                                    return (
                                        <a 
                                            key={idx} 
                                            href={web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group print:border-none print:p-0 print:block"
                                        >
                                            <div className="p-2 bg-slate-50 group-hover:bg-indigo-50 rounded-md text-slate-400 group-hover:text-indigo-600 transition-colors print:hidden">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 print:text-black print:underline">
                                                    {web.title}
                                                </div>
                                                <div className="text-xs text-slate-400 truncate mt-0.5 print:text-slate-600">
                                                    {new URL(web.uri).hostname}
                                                </div>
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                 </div>
             ) : (
                <div className="text-center text-slate-500 py-12">No jobs found.</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeResult;