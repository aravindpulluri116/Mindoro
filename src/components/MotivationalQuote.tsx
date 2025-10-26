import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
}

const MotivationalQuote = () => {
  const [quote, setQuote] = useState<Quote>({ text: '', author: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.quotable.io/quotes/random?tags=inspirational');
      const data = await response.json();
      if (data && data[0]) {
        setQuote({
          text: data[0].content,
          author: data[0].author,
        });
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      // Fallback quotes
      const fallbackQuotes = [
        { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
        { text: 'Focus is a matter of deciding what things you\'re not going to do.', author: 'John Carmack' },
        { text: 'Concentrate all your thoughts upon the work in hand. The sun\'s rays do not burn until brought to a focus.', author: 'Alexander Graham Bell' },
        { text: 'It\'s not always that we need to do more but rather that we need to focus on less.', author: 'Nathan W. Morris' },
      ];
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 pt-6 border-t border-white/20"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/60 text-sm italic"
              >
                Loading inspiration...
              </motion.div>
            ) : (
              <motion.div
                key={quote.text}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white/90 text-sm italic leading-relaxed mb-2">
                  "{quote.text}"
                </p>
                <p className="text-white/60 text-xs">— {quote.author}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchQuote}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 flex-shrink-0"
          aria-label="Get new quote"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MotivationalQuote;
