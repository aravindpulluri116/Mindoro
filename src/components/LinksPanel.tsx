import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Link2, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloatingShell } from '@/components/FloatingShell';
import { springSnappy, springSoft } from '@/lib/motion-variants';

const STORAGE_KEY = 'savedLinks';

export interface SavedLink {
  id: string;
  title: string;
  url: string;
}

function normalizeUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

const LinksPanel = () => {
  const [links, setLinks] = useState<SavedLink[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  const handleAdd = () => {
    const t = title.trim();
    const u = normalizeUrl(url);
    if (!t || !u) return;
    setLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: t, url: u },
    ]);
    setTitle('');
    setUrl('');
    setIsAdding(false);
  };

  const openLink = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full">
      <FloatingShell className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-white font-semibold text-lg sm:text-xl flex items-center gap-2">
            <Link2 className="w-5 h-5 text-white/70" />
            Links
          </h2>
          <span className="text-white/60 text-sm tabular-nums">{links.length}</span>
        </div>

        <div className="space-y-2 mb-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {links.map((link) => (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, x: 18, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -14, scale: 0.98 }}
                transition={springSoft}
                className="flex items-center gap-2 rounded-xl p-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] hover:border-white/12 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] group"
              >
                <button
                  type="button"
                  onClick={() => openLink(link.url)}
                  className="min-w-0 flex-1 text-left flex items-start gap-2 rounded-lg py-0.5 -my-0.5"
                >
                  <ExternalLink className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                  <span className="text-white font-medium truncate">{link.title}</span>
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  transition={springSnappy}
                  onClick={() => setLinks((prev) => prev.filter((l) => l.id !== link.id))}
                  className="opacity-0 group-hover:opacity-100 sm:opacity-100 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-opacity shrink-0"
                  aria-label="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isAdding ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={springSoft}
              className="space-y-2"
            >
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                onKeyDown={(e) => e.key === 'Escape' && (setIsAdding(false), setTitle(''), setUrl(''))}
              />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex flex-wrap gap-2">
                <motion.div whileTap={{ scale: 0.97 }} transition={springSnappy}>
                  <Button
                    type="button"
                    onClick={handleAdd}
                    size="sm"
                    className="bg-white text-pomodoro hover:bg-white/90 font-medium rounded-lg"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }} transition={springSnappy}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 rounded-lg"
                    onClick={() => {
                      setIsAdding(false);
                      setTitle('');
                      setUrl('');
                    }}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={springSoft}
            >
              <motion.button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full bg-black/20 hover:bg-black/30 text-white border-2 border-dashed border-white/30 font-medium py-5 rounded-xl flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.45)' }}
                whileTap={{ scale: 0.99 }}
                transition={springSnappy}
              >
                <Plus className="w-5 h-5" />
                Add link
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingShell>
    </div>
  );
};

export default LinksPanel;
