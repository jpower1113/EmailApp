import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ThreatIndicator {
  type: string;
  severity: string;
  description: string;
  evidence?: string;
}

interface AnalysisResult {
  isMalicious: boolean;
  riskLevel: string;
  threatIndicators: ThreatIndicator[];
  summary: string;
}

function analyzeContent(content: string, fileName: string): AnalysisResult {
  const threatIndicators: ThreatIndicator[] = [];
  const lowerContent = content.toLowerCase();

  const suspiciousUrls = [
    /bit\.ly/gi,
    /tinyurl\.com/gi,
    /goo\.gl/gi,
    /ow\.ly/gi,
    /t\.co/gi,
  ];

  const phishingKeywords = [
    { pattern: /verify\s+(your|account|identity|payment)/gi, severity: "high" },
    { pattern: /suspend(ed)?\s+(your)?\s*account/gi, severity: "high" },
    { pattern: /urgent(ly)?\s+(action|response|update)/gi, severity: "medium" },
    { pattern: /confirm\s+(your\s+)?(password|identity|account)/gi, severity: "high" },
    { pattern: /update\s+(your\s+)?(payment|billing|card)/gi, severity: "high" },
    { pattern: /click\s+(here|now|immediately)/gi, severity: "medium" },
    { pattern: /act\s+now/gi, severity: "medium" },
    { pattern: /limited\s+time/gi, severity: "low" },
    { pattern: /congratulations.*won/gi, severity: "high" },
    { pattern: /claim\s+your\s+prize/gi, severity: "high" },
    { pattern: /social\s+security\s+number/gi, severity: "critical" },
    { pattern: /bank\s+account\s+number/gi, severity: "critical" },
    { pattern: /credit\s+card\s+(number|details)/gi, severity: "critical" },
    { pattern: /password\s+reset/gi, severity: "medium" },
  ];

  const suspiciousDomains = [
    /paypa1/gi,
    /amaz0n/gi,
    /g00gle/gi,
    /micr0soft/gi,
    /netfIix/gi,
  ];

  suspiciousUrls.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      threatIndicators.push({
        type: "Suspicious URL",
        severity: "medium",
        description: "Contains shortened URL that may hide malicious destination",
        evidence: matches[0]
      });
    }
  });

  phishingKeywords.forEach(({ pattern, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      threatIndicators.push({
        type: "Phishing Language",
        severity,
        description: `Detected phishing-related language: "${matches[0]}"`,
        evidence: matches[0]
      });
    }
  });

  suspiciousDomains.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      threatIndicators.push({
        type: "Typosquatting",
        severity: "critical",
        description: "Detected domain name that mimics legitimate brand",
        evidence: matches[0]
      });
    }
  });

  if (/mailto:/gi.test(content) && lowerContent.includes('urgent')) {
    threatIndicators.push({
      type: "Suspicious Email Link",
      severity: "medium",
      description: "Contains email link with urgent language"
    });
  }

  if ((lowerContent.match(/password/g) || []).length > 2) {
    threatIndicators.push({
      type: "Credential Request",
      severity: "high",
      description: "Multiple mentions of passwords or credentials"
    });
  }

  if (/\.(exe|bat|cmd|vbs|ps1|scr|dll)/gi.test(content)) {
    threatIndicators.push({
      type: "Dangerous Attachment",
      severity: "critical",
      description: "References executable file that could contain malware"
    });
  }

  const criticalCount = threatIndicators.filter(t => t.severity === "critical").length;
  const highCount = threatIndicators.filter(t => t.severity === "high").length;
  const mediumCount = threatIndicators.filter(t => t.severity === "medium").length;

  let riskLevel = "safe";
  let isMalicious = false;

  if (criticalCount > 0) {
    riskLevel = "critical";
    isMalicious = true;
  } else if (highCount >= 2) {
    riskLevel = "high";
    isMalicious = true;
  } else if (highCount === 1 && mediumCount >= 1) {
    riskLevel = "high";
    isMalicious = true;
  } else if (highCount === 1 || mediumCount >= 2) {
    riskLevel = "medium";
    isMalicious = true;
  } else if (mediumCount === 1) {
    riskLevel = "low";
  }

  let summary = "";
  if (riskLevel === "safe") {
    summary = "No significant threats detected. Content appears safe.";
  } else if (riskLevel === "low") {
    summary = "Low risk detected. Exercise caution but content may be legitimate.";
  } else if (riskLevel === "medium") {
    summary = "Moderate risk detected. Content shows suspicious characteristics.";
  } else if (riskLevel === "high") {
    summary = "High risk detected. Content likely malicious or phishing attempt.";
  } else {
    summary = "CRITICAL THREAT. Content highly likely to be malicious. Do not interact.";
  }

  return {
    isMalicious,
    riskLevel,
    threatIndicators,
    summary
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { content, fileName } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const analysis = analyzeContent(content, fileName || "unknown");

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to analyze content", details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});