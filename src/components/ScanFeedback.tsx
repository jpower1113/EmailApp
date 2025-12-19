import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { submitFeedback } from '../lib/feedbackUtils';

interface ScanFeedbackProps {
  fileName: string;
  detectionResult: 'malicious' | 'safe';
  confidenceScore: number;
  onFeedbackSubmitted: () => void;
}

export function ScanFeedback({
  fileName,
  detectionResult,
  confidenceScore,
  onFeedbackSubmitted,
}: ScanFeedbackProps) {
  const [userAssessment, setUserAssessment] = useState<'malicious' | 'safe' | 'unsure' | null>(null);
  const [threatType, setThreatType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!userAssessment) return;

    setIsSubmitting(true);
    const success = await submitFeedback({
      wasCorrect: userAssessment === detectionResult,
      userAssessment,
      detectionResult,
      threatType: threatType || undefined,
      confidenceScore,
      fileName,
    });

    if (success) {
      setSubmitted(true);
      onFeedbackSubmitted();
      setTimeout(() => {
        setUserAssessment(null);
        setThreatType('');
        setSubmitted(false);
      }, 2000);
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-medium">Thank you! Your feedback helps improve detection.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-gray-700 mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Was this detection accurate? Your feedback helps train the system.
      </p>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Did we get it right?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setUserAssessment(detectionResult)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                userAssessment === detectionResult
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-green-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Yes, Correct
            </button>
            <button
              onClick={() => setUserAssessment(detectionResult === 'malicious' ? 'safe' : 'malicious')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                userAssessment === (detectionResult === 'malicious' ? 'safe' : 'malicious')
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-red-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              No, Wrong
            </button>
            <button
              onClick={() => setUserAssessment('unsure')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                userAssessment === 'unsure'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-yellow-500'
              }`}
            >
              Unsure
            </button>
          </div>
        </div>

        {userAssessment && userAssessment !== 'unsure' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Threat category (optional):
            </label>
            <select
              value={threatType}
              onChange={(e) => setThreatType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              <option value="phishing">Phishing</option>
              <option value="spam">Spam</option>
              <option value="malware">Malware</option>
              <option value="ransomware">Ransomware</option>
              <option value="credential_theft">Credential Theft</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {userAssessment && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        )}
      </div>
    </div>
  );
}
