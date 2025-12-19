import { useState } from 'react';
import { Shield, RotateCcw } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ScanResults } from './components/ScanResults';
import { ScanFeedback } from './components/ScanFeedback';
import { TrainingMetrics } from './components/TrainingMetrics';
import { supabase } from './lib/supabase';
import { analyzeContent, AnalysisResult } from './lib/malwareDetector';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [feedbackKey, setFeedbackKey] = useState(0);

  const analyzeFile = async (content: string, name: string) => {
    setIsAnalyzing(true);
    setError('');
    setFileName(name);

    try {
      const analysisResult = analyzeContent(content);
      setResult(analysisResult);

      await supabase.from('scans').insert({
        file_name: name,
        file_content: content,
        is_malicious: analysisResult.isMalicious,
        risk_level: analysisResult.riskLevel,
        threat_indicators: analysisResult.threatIndicators,
      });
    } catch (err) {
      setError('Failed to analyze file. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setFileName('');
    setError('');
    setFeedbackKey(prev => prev + 1);
  };

  const handleFeedbackSubmitted = () => {
    setFeedbackKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Email & SMS Malware Scanner
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload emails or text messages to detect malicious content, phishing attempts, and security threats
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {!result ? (
            <>
              <TrainingMetrics />
              <div className="bg-white rounded-xl shadow-lg p-8">
                <FileUpload onFileSelect={analyzeFile} isAnalyzing={isAnalyzing} />
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                    {error}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <ScanResults
                isMalicious={result.isMalicious}
                riskLevel={result.riskLevel}
                threatIndicators={result.threatIndicators}
                summary={result.summary}
                fileName={fileName}
              />
              <div className="mt-6">
                <ScanFeedback
                  key={feedbackKey}
                  fileName={fileName}
                  detectionResult={result.isMalicious ? 'malicious' : 'safe'}
                  confidenceScore={result.confidence}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={resetScan}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Scan Another File
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>This tool analyzes content for common malware and phishing indicators.</p>
          <p className="mt-1">Your feedback helps train the detection algorithm to improve accuracy over time.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
