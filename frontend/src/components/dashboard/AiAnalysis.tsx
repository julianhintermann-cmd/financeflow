import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyzeExpenses } from '@/api/client';
import { Sparkles, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';

export default function AiAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    tips: string[];
    trends: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeExpenses();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Analysis
          </CardTitle>
          <Button size="sm" onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Run Analysis'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!result && !error && !loading && (
          <p className="text-sm text-muted-foreground">
            Click "Run Analysis" to get an AI-powered summary of your expenses.
          </p>
        )}
        {result && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{result.summary}</p>

            {result.tips.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Saving Tips
                </h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.trends.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Trends
                </h4>
                <ul className="space-y-1">
                  {result.trends.map((trend, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span> {trend}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
