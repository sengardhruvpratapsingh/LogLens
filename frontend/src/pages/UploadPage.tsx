import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  FileCode,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { SampleFileItem } from '../types';
import { Card } from '../components/common/Card';
import { formatFileSize } from '../utils/formatters';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.log', '.txt', '.jsonl'];

type UploadStage = 'idle' | 'validating' | 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleFileItem[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [sampleProcessingId, setSampleProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setLoadingSamples(true);
        const data = await api.getSampleLogs();
        setSamples(data);
      } catch {
        // Fallback or offline
      } finally {
        setLoadingSamples(false);
      }
    };
    fetchSamples();
  }, []);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format '${ext}'. Only ${ALLOWED_EXTENSIONS.join(', ')} are supported.`;
    }
    if (file.size === 0) {
      return 'The selected file is empty.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 10 MB.`;
    }
    return null;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    try {
      setStage('validating');
      await new Promise((r) => setTimeout(r, 200));

      setStage('uploading');
      await new Promise((r) => setTimeout(r, 300));

      setStage('parsing');
      const result = await api.uploadLogFile(selectedFile);

      setStage('analyzing');
      await new Promise((r) => setTimeout(r, 300));

      setStage('complete');
      setTimeout(() => {
        navigate(`/analysis/${result.id}`);
      }, 500);
    } catch (err: any) {
      setStage('error');
      setErrorMessage(err.message || 'An error occurred during file analysis.');
    }
  };

  const handleSampleSelect = async (sampleId: string) => {
    try {
      setSampleProcessingId(sampleId);
      setErrorMessage(null);
      const result = await api.analyzeSampleLog(sampleId);
      navigate(`/analysis/${result.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process sample log file.');
      setSampleProcessingId(null);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setStage('idle');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stagesList = [
    { key: 'validating', label: 'Validating format & size' },
    { key: 'uploading', label: 'Streaming file bytes' },
    { key: 'parsing', label: 'Extracting structured records' },
    { key: 'analyzing', label: 'Computing diagnostics & patterns' },
  ];

  const getStageIndex = (s: UploadStage) => {
    if (s === 'validating') return 0;
    if (s === 'uploading') return 1;
    if (s === 'parsing') return 2;
    if (s === 'analyzing' || s === 'complete') return 3;
    return -1;
  };

  const currentStageIndex = getStageIndex(stage);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Log Upload & Diagnostic Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload application log files to automatically parse records, classify severities, and uncover recurring error patterns.
        </p>
      </div>

      {/* Main Upload Box */}
      <Card className="p-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm leading-relaxed">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Drag and Drop Zone */}
        {stage === 'idle' && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#22D3EE] bg-[#22D3EE]/5 shadow-xl shadow-cyan-950/20'
                  : 'border-[#1E2D4A] hover:border-slate-500 bg-[#111B2E]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".log,.txt,.jsonl"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-[#172337] border border-[#1E2D4A] flex items-center justify-center text-[#22D3EE] mx-auto mb-4 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-1">
                Drag and drop your log file here, or{' '}
                <span className="text-[#22D3EE] hover:underline">browse files</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Supports <span className="text-slate-200 font-mono">.log</span>,{' '}
                <span className="text-slate-200 font-mono">.txt</span>, and{' '}
                <span className="text-slate-200 font-mono">.jsonl</span> up to 10 MB.
              </p>

              <div className="inline-flex items-center gap-2 text-[11px] text-slate-400 px-3 py-1 rounded-full bg-[#0B1220] border border-[#1E2D4A]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Files are processed safely in-memory and secrets are redacted automatically</span>
              </div>
            </div>

            {/* Selected File Card Preview */}
            {selectedFile && (
              <div className="mt-6 p-4 rounded-xl bg-[#111B2E] border border-[#22D3EE]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#172337] border border-[#1E2D4A] flex items-center justify-center text-[#22D3EE]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{selectedFile.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatFileSize(selectedFile.size)} • ready for analysis
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetForm}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Remove File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleStartAnalysis}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <span>Analyze Log File</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Progress Status */}
        {stage !== 'idle' && (
          <div className="py-12 px-4 text-center max-w-md mx-auto space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              {stage === 'error' ? (
                <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#172337] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {stage === 'error'
                  ? 'Analysis Encountered an Error'
                  : stage === 'complete'
                  ? 'Analysis Complete! Redirecting...'
                  : 'Analyzing Log Records...'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile?.name || 'Processing telemetry stream'}
              </p>
            </div>

            {/* Steps indicator */}
            <div className="space-y-2 text-left bg-[#111B2E] p-4 rounded-xl border border-[#1E2D4A]">
              {stagesList.map((st, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx && stage !== 'error';
                return (
                  <div key={st.key} className="flex items-center gap-3 text-xs">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-[#22D3EE] animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span
                      className={
                        isPassed
                          ? 'text-slate-300 font-medium'
                          : isCurrent
                          ? 'text-[#22D3EE] font-bold'
                          : 'text-slate-500'
                      }
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {stage === 'error' && (
              <button
                onClick={resetForm}
                className="px-5 py-2 rounded-lg bg-[#1E2D4A] text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Clear & Try Again
              </button>
            )}
          </div>
        )}
      </Card>

      {/* TRY SAMPLE LOG SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#22D3EE]" />
          <h2 className="text-base font-bold text-slate-200">
            Or Test Instantly With Real Demonstration Logs
          </h2>
        </div>
        <p className="text-xs text-slate-400 -mt-2">
          Preloaded demonstration logs allow you to explore charts, multiline stack trace parsing, and recurring pattern detection right away.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samples.map((sample) => (
            <Card
              key={sample.id}
              className="p-5 flex flex-col justify-between hover:border-[#22D3EE]/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-[#0B1220] border border-[#1E2D4A] text-[#22D3EE] uppercase">
                    .{sample.format}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(sample.size_bytes)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm group-hover:text-[#22D3EE] transition-colors mb-1.5">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {sample.description}
                </p>
              </div>

              <button
                onClick={() => handleSampleSelect(sample.id)}
                disabled={sampleProcessingId !== null}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A] hover:bg-[#22D3EE] hover:text-[#0B1220] text-slate-200 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {sampleProcessingId === sample.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing {sample.name}...</span>
                  </>
                ) : (
                  <>
                    <span>Load & Analyze Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
