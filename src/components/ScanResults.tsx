import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';

interface ThreatIndicator {
  type: string;
  severity: string;
  description: string;
  evidence?: string;
}

interface ScanResultsProps {
  isMalicious: boolean;
  riskLevel: string;
  threatIndicators: ThreatIndicator[];
  summary: string;
  fileName: string;
}

const riskColors = {
  safe: 'bg-green-50 border-green-200',
  low: 'bg-yellow-50 border-yellow-200',
  medium: 'bg-orange-50 border-orange-200',
  high: 'bg-red-50 border-red-200',
  critical: 'bg-red-100 border-red-300',
};

const riskTextColors = {
  safe: 'text-green-800',
  low: 'text-yellow-800',
  medium: 'text-orange-800',
  high: 'text-red-800',
  critical: 'text-red-900',
};

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900',
};

export function ScanResults({ isMalicious, riskLevel, threatIndicators, summary, fileName }: ScanResultsProps) {
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'safe':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'low':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'medium':
        return <AlertTriangle className="w-16 h-16 text-orange-500" />;
      case 'high':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'critical':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <Shield className="w-16 h-16 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`border-2 rounded-lg p-8 mb-6 ${riskColors[riskLevel as keyof typeof riskColors]}`}
      >
        <div className="flex items-center justify-center mb-4">
          {getRiskIcon()}
        </div>
        <h2 className={`text-2xl font-bold text-center mb-2 ${riskTextColors[riskLevel as keyof typeof riskTextColors]}`}>
          {isMalicious ? 'Threat Detected' : 'Safe Content'}
        </h2>
        <p className={`text-center text-lg mb-4 ${riskTextColors[riskLevel as keyof typeof riskTextColors]}`}>
          Risk Level: <span className="font-semibold uppercase">{riskLevel}</span>
        </p>
        <p className="text-center text-gray-700 mb-2">
          <span className="font-medium">File:</span> {fileName}
        </p>
        <p className={`text-center ${riskTextColors[riskLevel as keyof typeof riskTextColors]}`}>
          {summary}
        </p>
      </div>

      {threatIndicators.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Detected Threats ({threatIndicators.length})
          </h3>
          <div className="space-y-3">
            {threatIndicators.map((indicator, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{indicator.type}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      severityColors[indicator.severity as keyof typeof severityColors]
                    }`}
                  >
                    {indicator.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{indicator.description}</p>
                {indicator.evidence && (
                  <div className="bg-gray-50 rounded p-2 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Evidence:</p>
                    <code className="text-xs text-gray-800 break-all">{indicator.evidence}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
