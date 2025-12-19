/*
  # Email Malware Scanner Feedback & Training

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key) - Unique identifier for feedback entry
      - `scan_id` (uuid, optional) - Reference to the original scan
      - `was_correct` (boolean) - Whether the detection was accurate
      - `user_assessment` (text) - User's assessment: 'malicious', 'safe', or 'unsure'
      - `detection_result` (text) - What the system detected
      - `threat_type` (text) - Category of threat for training
      - `confidence_score` (integer) - System's confidence in its detection (0-100)
      - `file_name` (text) - Name of analyzed file
      - `created_at` (timestamptz) - When feedback was submitted
    - `training_metrics`
      - `id` (uuid, primary key) - Unique identifier
      - `metric_date` (date) - Date for the metric
      - `true_positives` (integer) - Correctly identified malicious content
      - `true_negatives` (integer) - Correctly identified safe content
      - `false_positives` (integer) - Safe content marked as malicious
      - `false_negatives` (integer) - Malicious content marked as safe
      - `accuracy` (numeric) - Calculated accuracy percentage
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Allow public inserts to feedback (for scanner usage)
    - Allow public reads of training metrics (for transparency)
    - Add policies for data collection
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid,
  was_correct boolean NOT NULL,
  user_assessment text NOT NULL CHECK (user_assessment IN ('malicious', 'safe', 'unsure')),
  detection_result text NOT NULL,
  threat_type text,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  file_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date DEFAULT CURRENT_DATE,
  true_positives integer DEFAULT 0,
  true_negatives integer DEFAULT 0,
  false_positives integer DEFAULT 0,
  false_negatives integer DEFAULT 0,
  accuracy numeric(5,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(metric_date)
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback"
  ON feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view training metrics"
  ON training_metrics
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update training metrics"
  ON training_metrics
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert training metrics"
  ON training_metrics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
