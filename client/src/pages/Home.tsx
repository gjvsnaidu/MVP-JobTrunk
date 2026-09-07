import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Moon, Sun, Trash2, Copy } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface PredictionResult {
  sentiment: string;
  confidence: number;
  raw_score: number;
}

interface HistoryItem {
  review: string;
  sentiment: string;
  confidence: number;
  timestamp: number;
}

const EXAMPLE_REVIEWS = [
  'The food was great!',
  'Delivery was very late and cold',
  'Amazing service and quality',
  'Worst experience ever',
  'Worth every penny',
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('sentimentHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sentimentHistory', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!review.trim()) {
      setError('Please enter a review to analyze');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review: review.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The sentiment service could not analyze this review.');
      }
      setResult(data);

      // Add to history
      const newHistoryItem: HistoryItem = {
        review: review.trim(),
        sentiment: data.sentiment,
        confidence: data.confidence,
        timestamp: Date.now(),
      };
      setHistory((currentHistory) => [newHistoryItem, ...currentHistory]);
      toast.success('Sentiment analyzed successfully!');
    } catch (err) {
      const errorMessage = err instanceof TypeError
        ? 'Unable to connect to the sentiment service. Please try again.'
        : err instanceof Error
          ? err.message
          : 'Something went wrong while analyzing your review.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setReview(example);
    setError(null);
  };

  const handleClear = () => {
    setReview('');
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  const handleCopyReview = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const charCount = review.length;
  const maxChars = 1000;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      {/* Header with theme toggle */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            ARTHAM
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            ARTHAM — AI Sentiment Predictor
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Analyze the sentiment of any review with AI-powered precision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Textarea Card */}
            <div className={`rounded-2xl backdrop-blur-xl border transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50' : 'bg-white/40 border-slate-200/50 hover:border-slate-300/50'}`}>
              <div className="p-6 space-y-4">
                <Textarea
                  value={review}
                  onChange={(e) => {
                    setReview(e.target.value.slice(0, maxChars));
                    setError(null);
                  }}
                  placeholder="Enter a review to analyze…"
                  className={`min-h-32 resize-none rounded-lg border-0 ${theme === 'dark' ? 'bg-slate-900/50 text-white placeholder-slate-500' : 'bg-white/50 text-slate-900 placeholder-slate-400'} focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
                />
                <div className="flex justify-between items-center text-sm">
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    {charCount} / {maxChars} characters
                  </span>
                  <button
                    onClick={handleClear}
                    className={`px-3 py-1 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 animate-fade-in">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Example Chips */}
            <div className="space-y-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Try example reviews:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_REVIEWS.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${theme === 'dark' ? 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600/50' : 'bg-slate-200/50 text-slate-700 hover:bg-slate-300/50 border border-slate-300/50'}`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={loading || !review.trim()}
              className="w-full py-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Sentiment'
              )}
            </Button>

            {/* Result Card */}
            {result && (
              <div className={`rounded-2xl backdrop-blur-xl border transition-all duration-300 animate-fade-in ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/40 border-slate-200/50'}`}>
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Sentiment Result
                      </p>
                      <h3 className={`text-3xl font-bold mt-2 ${result.sentiment === 'Positive' ? 'text-green-500' : 'text-red-500'}`}>
                        {result.sentiment === 'Positive' ? '😊 Positive' : '😞 Negative'}
                      </h3>
                    </div>
                    <div className="text-4xl">
                      {result.sentiment === 'Positive' ? '✨' : '⚠️'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Confidence
                      </span>
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {result.confidence}%
                      </span>
                    </div>
                    <Progress
                      value={result.confidence}
                      className="h-2 rounded-full"
                    />
                  </div>

                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {result.sentiment === 'Positive'
                      ? 'This review expresses positive sentiment with strong confidence.'
                      : 'This review expresses negative sentiment with strong confidence.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* History Panel */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl backdrop-blur-xl border sticky top-24 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/40 border-slate-200/50'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    History
                  </h3>
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className={`p-1 rounded transition-all duration-200 ${theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700/50' : 'text-slate-600 hover:text-red-600 hover:bg-slate-200/50'}`}
                      title="Clear history"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      No predictions yet. Analyze a review to get started!
                    </p>
                  ) : (
                    history.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all duration-200 ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50' : 'bg-slate-100/30 border-slate-300/30 hover:border-slate-400/50'}`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className={`text-xs font-medium ${item.sentiment === 'Positive' ? 'text-green-500' : 'text-red-500'}`}>
                            {item.sentiment}
                          </p>
                          <button
                            onClick={() => handleCopyReview(item.review)}
                            className={`p-1 rounded transition-all duration-200 ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Copy review"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <p className={`text-xs line-clamp-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                          {item.review}
                        </p>
                        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                          {item.confidence}% confidence
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
