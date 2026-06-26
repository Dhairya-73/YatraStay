/**
 * Utility for input sanitization and security filtering.
 * File: utils/sanitizer.js
 */

/**
 * Sanitize and clean raw user string inputs
 * @param {string} input Raw user search query
 * @returns {string} Cleaned, sanitized query
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Limit length to prevent Denial of Service (DoS) and excessive token consumption
  const MAX_LENGTH = 250;
  if (clean.length > MAX_LENGTH) {
    clean = clean.substring(0, MAX_LENGTH);
  }

  // 3. Strip HTML tags to prevent XSS injection
  clean = clean.replace(/<[^>]*>/g, "");

  // 4. Escape dangerous characters that could interfere with MongoDB regex or EJS rendering
  clean = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // 5. Basic Prompt Injection detection: scan for instruction override keywords
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous\s+)?instructions/i,
    /forget\s+(all\s+)?(previous\s+)?instructions/i,
    /system\s+prompt/i,
    /you\s+are\s+now\s+a/i,
    /override\s+rules/i,
    /new\s+role/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(clean)) {
      console.warn(`[Sanitizer] Potential prompt injection pattern detected and sanitized: "${clean}"`);
      // Neutralize the injection by overriding the prompt to a safe generic lookup
      return "Search request neutralized due to security policies.";
    }
  }

  return clean;
};
