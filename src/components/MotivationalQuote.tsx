import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
}

// 100+ Curated motivational and productivity quotes
const QUOTES: Quote[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'The key is not to prioritize what\'s on your schedule, but to schedule your priorities.', author: 'Stephen Covey' },
  { text: 'Concentrate all your thoughts upon the work in hand.', author: 'Alexander Graham Bell' },
  { text: 'It\'s not always that we need to do more but rather that we need to focus on less.', author: 'Nathan W. Morris' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'Amateurs sit and wait for inspiration, the rest of us just get up and go to work.', author: 'Stephen King' },
  { text: 'Your work is going to fill a large part of your life, do what you love.', author: 'Steve Jobs' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Productivity is never an accident. It is always the result of commitment to excellence.', author: 'Paul J. Meyer' },
  { text: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
  { text: 'Time is what we want most, but what we use worst.', author: 'William Penn' },
  { text: 'You may delay, but time will not.', author: 'Benjamin Franklin' },
  { text: 'Lost time is never found again.', author: 'Benjamin Franklin' },
  { text: 'The shorter way to do many things is to only do one thing at a time.', author: 'Mozart' },
  { text: 'What you do today can improve all your tomorrows.', author: 'Ralph Marston' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Don\'t count the days, make the days count.', author: 'Muhammad Ali' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The harder you work for something, the greater you\'ll feel when you achieve it.', author: 'Unknown' },
  { text: 'Dream it. Wish it. Do it.', author: 'Unknown' },
  { text: 'Success doesn\'t just find you. You have to go out and get it.', author: 'Unknown' },
  { text: 'Great things never come from comfort zones.', author: 'Unknown' },
  { text: 'Dream it. Believe it. Build it.', author: 'Unknown' },
  { text: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { text: 'Little things make big days.', author: 'Unknown' },
  { text: 'It\'s going to be hard, but hard does not mean impossible.', author: 'Unknown' },
  { text: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: 'Unknown' },
  { text: 'Wake up with determination. Go to bed with satisfaction.', author: 'Unknown' },
  { text: 'Do it now. Sometimes later becomes never.', author: 'Unknown' },
  { text: 'The difference between ordinary and extraordinary is that little extra.', author: 'Jimmy Johnson' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { text: 'Try again. Fail again. Fail better.', author: 'Samuel Beckett' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
  { text: 'Success is walking from failure to failure with no loss of enthusiasm.', author: 'Winston Churchill' },
  { text: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair' },
  { text: 'Procrastination is the art of keeping up with yesterday.', author: 'Don Marquis' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'Don\'t wish it were easier. Wish you were better.', author: 'Jim Rohn' },
  { text: 'Do what you can with all you have, wherever you are.', author: 'Theodore Roosevelt' },
  { text: 'You don\'t have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.' },
  { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau' },
  { text: 'Opportunities don\'t happen. You create them.', author: 'Chris Grosser' },
  { text: 'Don\'t be afraid to give up the good to go for the great.', author: 'John D. Rockefeller' },
  { text: 'I find that the harder I work, the more luck I seem to have.', author: 'Thomas Jefferson' },
  { text: 'If you are not willing to risk the usual, you will have to settle for the ordinary.', author: 'Jim Rohn' },
  { text: 'The only place where success comes before work is in the dictionary.', author: 'Vidal Sassoon' },
  { text: 'Stop doubting yourself. Work hard and make it happen.', author: 'Unknown' },
  { text: 'Your limitation—it\'s only your imagination.', author: 'Unknown' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Sometimes later becomes never. Do it now.', author: 'Unknown' },
  { text: 'Great things never came from comfort zones.', author: 'Unknown' },
  { text: 'Dream it. Wish it. Do it.', author: 'Unknown' },
  { text: 'Success is not how high you have climbed, but how you make a positive difference to the world.', author: 'Roy T. Bennett' },
  { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'What we think, we become.', author: 'Buddha' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Eighty percent of success is showing up.', author: 'Woody Allen' },
  { text: 'I attribute my success to this: I never gave or took any excuse.', author: 'Florence Nightingale' },
  { text: 'Winning isn\'t everything, but wanting to win is.', author: 'Vince Lombardi' },
  { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford' },
  { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { text: 'Every strike brings me closer to the next home run.', author: 'Babe Ruth' },
  { text: 'Definiteness of purpose is the starting point of all achievement.', author: 'W. Clement Stone' },
  { text: 'We must balance conspicuous consumption with conscious capitalism.', author: 'Kevin Kruse' },
  { text: 'Life is what happens to you while you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'We become what we think about.', author: 'Earl Nightingale' },
  { text: 'The most difficult thing is the decision to act, the rest is merely tenacity.', author: 'Amelia Earhart' },
  { text: 'How wonderful it is that nobody need wait a single moment before starting to improve the world.', author: 'Anne Frank' },
  { text: 'Setting goals is the first step in turning the invisible into the visible.', author: 'Tony Robbins' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: 'You don\'t need to be great to start, but you need to start to be great.', author: 'Zig Ziglar' },
  { text: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupéry' },
  { text: 'Twenty years from now you will be more disappointed by the things that you didn\'t do than by the ones you did do.', author: 'Mark Twain' },
  { text: 'The only person you are destined to become is the person you decide to be.', author: 'Ralph Waldo Emerson' },
  { text: 'Go confidently in the direction of your dreams. Live the life you have imagined.', author: 'Henry David Thoreau' },
  { text: 'Few things can help an individual more than to place responsibility on him, and to let him know that you trust him.', author: 'Booker T. Washington' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'Build your own dreams, or someone else will hire you to build theirs.', author: 'Farrah Gray' },
  { text: 'The question isn\'t who is going to let me; it\'s who is going to stop me.', author: 'Ayn Rand' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Everything has beauty, but not everyone can see.', author: 'Confucius' },
  { text: 'If you are working on something that you really care about, you don\'t have to be pushed. The vision pulls you.', author: 'Steve Jobs' },
  { text: 'People who are crazy enough to think they can change the world, are the ones who do.', author: 'Rob Siltanen' },
  { text: 'Failure will never overtake me if my determination to succeed is strong enough.', author: 'Og Mandino' },
  { text: 'We may encounter many defeats but we must not be defeated.', author: 'Maya Angelou' },
  { text: 'Knowing is not enough; we must apply. Wishing is not enough; we must do.', author: 'Johann Wolfgang Von Goethe' },
  { text: 'Imagine your life is perfect in every respect; what would it look like?', author: 'Brian Tracy' },
  { text: 'We generate fears while we sit. We overcome them by action.', author: 'Dr. Henry Link' },
];

// Productivity tips
const PRODUCTIVITY_TIPS = [
  'Take a 5-minute walk during your break to refresh your mind.',
  'Turn off notifications during focus sessions for better concentration.',
  'Start with your most challenging task when your energy is highest.',
  'Use the 2-minute rule: if it takes less than 2 minutes, do it now.',
  'Review your goals at the start of each Pomodoro session.',
  'Break large tasks into smaller, manageable chunks.',
  'Set specific goals for each work session.',
  'Eliminate distractions before starting your focus time.',
  'Plan your next day the night before to hit the ground running.',
  'Take regular breaks to maintain long-term productivity.',
];

const MotivationalQuote = () => {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [productivityTip] = useState<string>(
    PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)]
  );
  const hasLoadedRef = useRef(false);

  // Get random quote (avoiding current one)
  const getRandomIndex = (currentIdx: number) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === currentIdx && QUOTES.length > 1);
    return newIndex;
  };

  // Show random quote
  const nextQuote = (source: 'tab' | 'button' = 'button') => {
    const newIndex = getRandomIndex(currentIndex);
    setCurrentIndex(newIndex);
    
    const icon = source === 'tab' ? '🔄' : '👆';
    console.log(`${icon} ${source === 'tab' ? 'Tab return' : 'Manual refresh'} - Random quote ${newIndex + 1}/${QUOTES.length}`);
  };

  // Initialize on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      console.log(`✅ Loaded ${QUOTES.length} quotes - displaying randomly`);
    }
  }, []);

  // Listen for tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        nextQuote('tab');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentIndex]);

  const currentQuote = QUOTES[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 pt-6 border-t border-white/20"
    >
      {/* Motivational Quote */}
      <div className="flex items-start gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.text}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white/90 text-sm italic leading-relaxed mb-2">
                "{currentQuote.text}"
              </p>
              <p className="text-white/60 text-xs">— {currentQuote.author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => nextQuote('button')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
          aria-label="Next quote"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Productivity Tip */}
      {productivityTip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-start gap-3 pt-6 border-t border-white/10"
        >
          <Lightbulb className="w-5 h-5 text-purple-300 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium mb-1">💡 Today's Productivity Tip</p>
            <p className="text-white/80 text-sm leading-relaxed">
              {productivityTip}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MotivationalQuote;
