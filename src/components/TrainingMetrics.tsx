import { useEffect, useState } from 'react';
import { TrendingUp, Activity, Target, AlertCircle } from 'lucide-react';
import { getTrainingMetrics, TrainingMetrics } from '../lib/feedbackUtils';

export function TrainingMetrics() {
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    const data = await getTrainingMetrics();
    setMetrics(data);
    setLoading(false);
  };

  if (loading || !metrics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        System Performance Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-medium mb-1">Accuracy</p>
          <p className="text-2xl font-bold text-green-700">{metrics.accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Precision</p>
          <p className="text-2xl font-bold text-blue-700">{metrics.precision.toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-medium mb-1">Recall</p>
          <p className="text-2xl font-bold text-purple-700">{metrics.recall.toFixed(1)}%</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium mb-1">Total Samples</p>
          <p className="text-2xl font-bold text-orange-700">
            {metrics.truePositives + metrics.trueNegatives +
             metrics.falsePositives + metrics.falseNegatives}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-xs text-gray-600">True Positives</p>
          </div>
          <p className="text-lg font-semibold text-gray-800">{metrics.truePositives}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-xs text-gray-600">True Negatives</p>
          </div>
          <p className="text-lg font-semibold text-gray-800">{metrics.trueNegatives}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <p className="text-xs text-gray-600">False Positives</p>
          </div>
          <p className="text-lg font-semibold text-gray-800">{metrics.falsePositives}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-xs text-gray-600">False Negatives</p>
          </div>
          <p className="text-lg font-semibold text-gray-800">{metrics.falseNegatives}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          Metrics update in real-time as users provide feedback. Higher accuracy, precision, and recall indicate better detection performance.
        </p>
      </div>
    </div>
  );
}
