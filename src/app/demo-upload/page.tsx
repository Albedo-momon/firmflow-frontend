'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';

interface UploadResponse {
  jobId: string;
  status: string;
}

interface StatusResponse {
  jobId: string;
  status: string;
  extraction?: any; // Raw extraction data from backend
  requires_review?: boolean;
  result?: {
    summary: string;
    keyFields: Record<string, any>;
  };
}

export default function DemoUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<
    StatusResponse['result'] | null
  >(null);
  const [rawExtraction, setRawExtraction] = useState<any>(null);
  const [parsedExtraction, setParsedExtraction] = useState<any>(null);
  const [parseError, setParseError] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [requiresReview, setRequiresReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zapierSuccess, setZapierSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Initialize debug mode from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setDebugMode(urlParams.get('debug') === '1');
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a PDF or DOCX file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await response.json();
      setJobId(data.jobId);
      setIsUploading(false);

      // Start polling for status
      startPolling(data.jobId);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const startPolling = (jobId: string) => {
    // Clear any existing polling first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsPolling(true);
    
    if (debugMode) {
      console.log(`[DEBUG] Starting polling for jobId: ${jobId}`);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/status/${jobId}`
        );
        if (!response.ok) {
          throw new Error('Status check failed');
        }

        const data: StatusResponse = await response.json();
        
        if (debugMode) {
          console.log(`[DEBUG] Poll response for jobId ${jobId}:`, data);
        }

        // Check for completion conditions
        if (data.status === 'done' || data.status === 'completed') {
          if (debugMode) {
            console.log(`[DEBUG] Stopping polling - Success. JobId: ${jobId}, Status: ${data.status}`);
          }
          
          // Process extraction data
          if (data.extraction) {
            setRawExtraction(data.extraction);
            
            let parsed = null;
            let hasParseError = false;
            
            if (typeof data.extraction === 'string') {
              try {
                parsed = JSON.parse(data.extraction);
              } catch (e) {
                hasParseError = true;
                console.error('Failed to parse extraction JSON:', e);
              }
            } else if (typeof data.extraction === 'object') {
              parsed = data.extraction;
            }
            
            setParsedExtraction(parsed);
            setParseError(hasParseError);
            
            console.debug('[FF][DISPLAY_EXTRACTION]', { 
              jobId, 
              parsedExists: !!parsed 
            });
          }
          
          setRequiresReview(!!data.requires_review);
          setExtractionResult(data.result || null);
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        } else if (data.status === 'error' || data.status === 'failed') {
          if (debugMode) {
            console.log(`[DEBUG] Stopping polling - Error. JobId: ${jobId}, Status: ${data.status}`);
          }
          setError('Processing failed');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      } catch (err) {
        if (debugMode) {
          console.log(`[DEBUG] Stopping polling - Network Error. JobId: ${jobId}, Error:`, err);
        }
        setError('Status check failed');
        setIsPolling(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    }, 2000);

    // Cleanup interval after 5 minutes
    timeoutRef.current = setTimeout(() => {
      if (debugMode) {
        console.log(`[DEBUG] Stopping polling - Timeout. JobId: ${jobId}`);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (isPolling) {
        setIsPolling(false);
        setError('Processing timeout');
      }
    }, 300000);
  };

  const handleSendToZapier = async () => {
    if (!extractionResult) return;

    try {
      const response = await fetch('http://localhost:4000/webhook/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractionResult),
      });

      if (response.ok) {
        setZapierSuccess(true);
        setTimeout(() => setZapierSuccess(false), 3000);
      } else {
        throw new Error('Zapier webhook failed');
      }
    } catch (err) {
      setError('Failed to send to Zapier');
    }
  };

  const resetUpload = () => {
    // Clear any active polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (debugMode && jobId) {
      console.log(`[DEBUG] Reset upload - clearing polling for jobId: ${jobId}`);
    }
    
    setSelectedFile(null);
    setJobId(null);
    setExtractionResult(null);
    setRawExtraction(null);
    setParsedExtraction(null);
    setParseError(false);
    setShowRawJson(false);
    setRequiresReview(false);
    setError(null);
    setZapierSuccess(false);
    setIsPolling(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Demo Upload</h1>
        <p className="mt-2 text-gray-600">
          Upload a PDF or DOCX file to see document processing in action
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800"
              />
              <p className="mt-2 text-sm text-gray-500">
                Supports PDF and DOCX files
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || isPolling}
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                variant="outline"
                onClick={resetUpload}
                disabled={isUploading || isPolling}
              >
                Reset
              </Button>
            </div>

            {isPolling && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Processing document...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Extraction Results
              {requiresReview && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Requires review
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPolling ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-500">Processing document...</p>
              </div>
            ) : !parsedExtraction && !rawExtraction ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>Upload a document to see extraction results</p>
              </div>
            ) : parseError ? (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    Extraction returned but could not be parsed. See raw JSON below.
                  </p>
                </div>
              </div>
            ) : parsedExtraction ? (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {parsedExtraction.summary || 
                     (parsedExtraction.extraction_timestamp ? 
                       `Document processed on ${new Date(parsedExtraction.extraction_timestamp).toLocaleDateString()}. Contract extraction completed successfully.` :
                       'Document extraction completed successfully.'
                     )}
                  </p>
                </div>

                {/* Parties */}
                {parsedExtraction.parties && parsedExtraction.parties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Parties</h4>
                    <div className="space-y-3">
                      {parsedExtraction.parties.slice(0, 5).map((party: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900">{party.name}</span>
                            <span className="text-xs text-gray-500 capitalize">{party.role}</span>
                          </div>
                          {party.contact?.email && (
                            <div className="text-sm text-gray-600">{party.contact.email}</div>
                          )}
                        </div>
                      ))}
                      {parsedExtraction.parties.length > 5 && (
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Show {parsedExtraction.parties.length - 5} more parties
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Obligations */}
                {(parsedExtraction.key_obligations || parsedExtraction.scope_of_work?.deliverables) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Obligations</h4>
                    <ul className="space-y-2">
                      {(parsedExtraction.key_obligations || parsedExtraction.scope_of_work?.deliverables || [])
                        .slice(0, 5)
                        .map((obligation: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-sm text-gray-600">
                              {typeof obligation === 'string' ? obligation : obligation.summary || obligation.description || 'Obligation details'}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Dates */}
                {(parsedExtraction.contract_details?.effective_date || parsedExtraction.contract_details?.expiration_date) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Important Dates</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {parsedExtraction.contract_details?.effective_date && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Effective Date</span>
                          <div className="text-sm text-gray-600">{parsedExtraction.contract_details.effective_date}</div>
                        </div>
                      )}
                      {parsedExtraction.contract_details?.expiration_date && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Expiration Date</span>
                          <div className="text-sm text-gray-600">{parsedExtraction.contract_details.expiration_date}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confidence Score */}
                {parsedExtraction.confidence_scores?.overall_accuracy && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Confidence</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(parsedExtraction.confidence_scores.overall_accuracy * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(parsedExtraction.confidence_scores.overall_accuracy * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No extraction data available.</p>
              </div>
            )}

            {/* Raw JSON Panel */}
            {(rawExtraction || parsedExtraction) && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className={`w-4 h-4 mr-2 transition-transform ${showRawJson ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Show raw extraction
                </button>
                
                {showRawJson && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Raw JSON Data</span>
                      <button
                        onClick={() => {
                          const jsonText = JSON.stringify(parsedExtraction || rawExtraction, null, 2);
                          navigator.clipboard.writeText(jsonText);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-64 border">
                      {JSON.stringify(parsedExtraction || rawExtraction, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Zapier Integration */}
            {parsedExtraction && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSendToZapier}
                  variant="outline"
                  className="w-full"
                  disabled={zapierSuccess}
                >
                  {zapierSuccess ? '✓ Sent to Zapier' : 'Send to Zapier'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
