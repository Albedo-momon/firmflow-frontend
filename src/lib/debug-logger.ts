// Client-side debug logging system for FirmFlow
export interface LogEntry {
  ts: string;
  tag: string;
  detail: string | object;
}

export type LogTag = 
  | 'UPLOAD_REQUEST'
  | 'UPLOAD_RESPONSE' 
  | 'UPLOAD_ERROR'
  | 'POLL_REQUEST'
  | 'POLL_RESPONSE'
  | 'POLL_ERROR'
  | 'POLL_TIMEOUT'
  | 'PARSE_ERROR'
  | 'DISPLAY_EXTRACTION'
  | 'SHOW_RAW_RESPONSE'
  | 'DEBUG_NOTE';

class DebugLogger {
  private maxEntries = 200;
  private logs: Map<string, LogEntry[]> = new Map();

  log(jobId: string, tag: LogTag, detail: string | object): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      tag,
      detail
    };

    // Console logging for live monitoring
    console.debug(`[${tag}]`, detail);

    // Get or create log array for this jobId
    if (!this.logs.has(jobId)) {
      this.logs.set(jobId, []);
    }

    const jobLogs = this.logs.get(jobId)!;
    jobLogs.unshift(entry); // Add to beginning (newest first)

    // Trim to max entries
    if (jobLogs.length > this.maxEntries) {
      jobLogs.splice(this.maxEntries);
    }

    // Persist to localStorage
    this.persistLogs(jobId, jobLogs);
  }

  getLogs(jobId: string): LogEntry[] {
    // Try to load from localStorage first
    const stored = this.loadLogs(jobId);
    if (stored.length > 0) {
      this.logs.set(jobId, stored);
      return stored;
    }

    return this.logs.get(jobId) || [];
  }

  clearLogs(jobId: string): void {
    this.logs.delete(jobId);
    localStorage.removeItem(`firmflow:logs:${jobId}`);
  }

  downloadLogs(jobId: string): void {
    const logs = this.getLogs(jobId);
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firmflow-logs-${jobId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private persistLogs(jobId: string, logs: LogEntry[]): void {
    try {
      localStorage.setItem(`firmflow:logs:${jobId}`, JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to persist logs to localStorage:', error);
    }
  }

  private loadLogs(jobId: string): LogEntry[] {
    try {
      const stored = localStorage.getItem(`firmflow:logs:${jobId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
      return [];
    }
  }

  // Get all job IDs that have logs
  getJobIds(): string[] {
    const jobIds = new Set<string>();
    
    // From memory
    for (const jobId of this.logs.keys()) {
      jobIds.add(jobId);
    }

    // From localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('firmflow:logs:')) {
        const jobId = key.replace('firmflow:logs:', '');
        jobIds.add(jobId);
      }
    }

    return Array.from(jobIds);
  }
}

// Singleton instance
export const debugLogger = new DebugLogger();