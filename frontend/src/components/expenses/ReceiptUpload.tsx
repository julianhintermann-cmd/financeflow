import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadReceipt } from '@/api/client';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

interface ReceiptUploadProps {
  onResult: (data: {
    amount: number | null;
    description: string | null;
    date: string | null;
    suggestedCategory: string | null;
    receiptPath: string;
  }) => void;
}

export default function ReceiptUpload({ onResult }: ReceiptUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await uploadReceipt(acceptedFiles[0]);
      setSuccess(true);
      onResult(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing receipt...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-sm text-green-500">Receipt recognized successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Drop image here...'
                : 'Drag & drop a receipt here, or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (max 10 MB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
