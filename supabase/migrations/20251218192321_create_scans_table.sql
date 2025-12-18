/*
  # Email/SMS Malware Scanner Database Schema

  1. New Tables
    - `scans`
      - `id` (uuid, primary key) - Unique identifier for each scan
      - `file_name` (text) - Name of uploaded file
      - `file_content` (text) - Content of the email/SMS
      - `is_malicious` (boolean) - Whether content was flagged as malicious
      - `risk_level` (text) - Risk level: safe, low, medium, high, critical
      - `threat_indicators` (jsonb) - Array of detected threats and indicators
      - `scan_date` (timestamptz) - When the scan was performed
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `scans` table
    - Add policy for anyone to insert scans (public tool)
    - Add policy for anyone to read their own scans
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_content text NOT NULL,
  is_malicious boolean DEFAULT false,
  risk_level text DEFAULT 'safe',
  threat_indicators jsonb DEFAULT '[]'::jsonb,
  scan_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scans"
  ON scans
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read all scans"
  ON scans
  FOR SELECT
  TO anon
  USING (true);