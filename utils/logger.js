/**
 * Reusable structured logger.
 * File: utils/logger.js
 */

class Logger {
  info(requestId, message, meta = {}) {
    this._log("INFO", requestId, message, meta);
  }

  warn(requestId, message, meta = {}) {
    this._log("WARN", requestId, message, meta);
  }

  error(requestId, message, errorObj = null, meta = {}) {
    const errorMeta = errorObj 
      ? { errorMessage: errorObj.message, stack: errorObj.stack, ...meta }
      : meta;
    this._log("ERROR", requestId, message, errorMeta);
  }

  _log(level, requestId, message, meta) {
    const timestamp = new Date().toISOString();
    const tracingPrefix = requestId ? `[ReqID: ${requestId}]` : "[System]";
    
    // Format metadata nicely
    const metaPayload = { ...meta };
    const metaStr = Object.keys(metaPayload).length 
      ? ` | Metrics: ${JSON.stringify(metaPayload)}` 
      : "";

    console.log(`[${timestamp}] [${level}] ${tracingPrefix} ${message}${metaStr}`);
  }
}

module.exports = new Logger();
