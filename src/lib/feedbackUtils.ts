import { supabase } from './supabase';

export interface FeedbackEntry {
  wasCorrect: boolean;
  userAssessment: 'malicious' | 'safe' | 'unsure';
  detectionResult: string;
  threatType?: string;
  confidenceScore: number;
  fileName: string;
  scanId?: string;
}

export interface TrainingMetrics {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
}

export async function submitFeedback(feedback: FeedbackEntry): Promise<boolean> {
  try {
    const { error } = await supabase.from('feedback').insert({
      was_correct: feedback.wasCorrect,
      user_assessment: feedback.userAssessment,
      detection_result: feedback.detectionResult,
      threat_type: feedback.threatType,
      confidence_score: feedback.confidenceScore,
      file_name: feedback.fileName,
      scan_id: feedback.scanId,
    });

    if (error) {
      console.error('Failed to submit feedback:', error);
      return false;
    }

    await updateTrainingMetrics(feedback);
    return true;
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return false;
  }
}

async function updateTrainingMetrics(feedback: FeedbackEntry): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: existingMetrics } = await supabase
      .from('training_metrics')
      .select('*')
      .eq('metric_date', today)
      .maybeSingle();

    let metrics = {
      true_positives: 0,
      true_negatives: 0,
      false_positives: 0,
      false_negatives: 0,
    };

    if (existingMetrics) {
      metrics = {
        true_positives: existingMetrics.true_positives,
        true_negatives: existingMetrics.true_negatives,
        false_positives: existingMetrics.false_positives,
        false_negatives: existingMetrics.false_negatives,
      };
    }

    const wasDetectedAsMalicious = feedback.detectionResult === 'malicious';
    const actuallyWasMalicious = feedback.userAssessment === 'malicious';

    if (wasDetectedAsMalicious && actuallyWasMalicious && feedback.wasCorrect) {
      metrics.true_positives++;
    } else if (!wasDetectedAsMalicious && !actuallyWasMalicious && feedback.wasCorrect) {
      metrics.true_negatives++;
    } else if (wasDetectedAsMalicious && !actuallyWasMalicious && !feedback.wasCorrect) {
      metrics.false_positives++;
    } else if (!wasDetectedAsMalicious && actuallyWasMalicious && !feedback.wasCorrect) {
      metrics.false_negatives++;
    }

    const total = metrics.true_positives + metrics.true_negatives +
                  metrics.false_positives + metrics.false_negatives;
    const accuracy = total > 0
      ? ((metrics.true_positives + metrics.true_negatives) / total) * 100
      : 0;

    if (existingMetrics) {
      await supabase
        .from('training_metrics')
        .update({
          ...metrics,
          accuracy: parseFloat(accuracy.toFixed(2)),
        })
        .eq('id', existingMetrics.id);
    } else {
      await supabase
        .from('training_metrics')
        .insert({
          metric_date: today,
          ...metrics,
          accuracy: parseFloat(accuracy.toFixed(2)),
        });
    }
  } catch (err) {
    console.error('Error updating training metrics:', err);
  }
}

export async function getTrainingMetrics(): Promise<TrainingMetrics | null> {
  try {
    const { data } = await supabase
      .from('training_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return null;
    }

    const total = data.true_positives + data.true_negatives +
                  data.false_positives + data.false_negatives;

    const precision = data.true_positives + data.false_positives > 0
      ? (data.true_positives / (data.true_positives + data.false_positives)) * 100
      : 0;

    const recall = data.true_positives + data.false_negatives > 0
      ? (data.true_positives / (data.true_positives + data.false_negatives)) * 100
      : 0;

    return {
      truePositives: data.true_positives,
      trueNegatives: data.true_negatives,
      falsePositives: data.false_positives,
      falseNegatives: data.false_negatives,
      accuracy: data.accuracy || 0,
      precision: parseFloat(precision.toFixed(2)),
      recall: parseFloat(recall.toFixed(2)),
    };
  } catch (err) {
    console.error('Error fetching training metrics:', err);
    return null;
  }
}

export async function getFeedbackCount(): Promise<number> {
  try {
    const { count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    return count || 0;
  } catch (err) {
    console.error('Error fetching feedback count:', err);
    return 0;
  }
}
