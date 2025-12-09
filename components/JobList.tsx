import React from 'react';
import ReactMarkdown from 'react-markdown';
import { JobSearchResponse } from '../types';
import { ArrowLeft, ExternalLink, Briefcase } from 'lucide-react';

interface JobListProps {
  result: JobSearchResponse;
  onReset: () => void;
}

const JobList: React.FC<JobListProps> = ({ result, onReset }) => {
  return (
    <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <button 
                onClick={onReset}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Search
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Top 5 Matched Jobs
            </div>
            <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/30">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* AI Response */}
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <div className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-li:marker:text-slate-300">
                        <ReactMarkdown>{result.text}</ReactMarkdown>
                    </div>
                </div>

                {/* Grounding Sources */}
                {result.groundingChunks && result.groundingChunks.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Verified Source Links
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {result.groundingChunks.map((chunk, idx) => {
                                const web = chunk.web;
                                if (!web) return null;
                                return (
                                    <a 
                                        key={idx} 
                                        href={web.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                                    >
                                        <div className="p-2 bg-slate-100 group-hover:bg-white rounded-md text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700">
                                                {web.title}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate mt-0.5">
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
        </div>
    </div>
  );
};

export default JobList;