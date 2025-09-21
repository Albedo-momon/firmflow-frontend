import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function DashboardPage() {
  // Mock data - in real app this would come from API
  const documents = [
    {
      id: 1,
      name: 'Contract_Analysis_Q4.pdf',
      status: 'completed',
      uploadedAt: '2024-01-15',
      summary:
        'Quarterly contract analysis with key terms and renewal dates identified.',
    },
    {
      id: 2,
      name: 'Invoice_Processing_Jan.docx',
      status: 'processing',
      uploadedAt: '2024-01-14',
      summary: 'Processing invoice data for January billing cycle.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your document processing workflows
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No documents
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{doc.name}</CardTitle>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doc.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : doc.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{doc.summary}</p>
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
