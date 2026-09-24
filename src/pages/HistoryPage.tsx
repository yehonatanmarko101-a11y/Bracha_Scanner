import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, History as HistoryIcon, Info, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "../contexts/SettingsContext";
import { motion, AnimatePresence } from "motion/react";

export default function HistoryPage() {
  const { t, tradition, language } = useSettings();
  const [scans, setScans] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const historyStr = localStorage.getItem("scans_history");
    if (historyStr) {
      try {
        setScans(JSON.parse(historyStr));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleDelete = async (id: string) => {
    const historyStr = localStorage.getItem("scans_history");
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        const filtered = history.filter((item: any) => item.id !== id);
        localStorage.setItem("scans_history", JSON.stringify(filtered));
        setScans(filtered);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-4 max-w-md mx-auto space-y-6 pt-8 ${language === "he" ? "text-right" : "text-left"}`} dir={language === "he" ? "rtl" : "ltr"}
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">{t('history_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('history_sub')}</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {scans.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 text-muted-foreground bg-card rounded-2xl p-6 shadow-sm border border-border/40"
            >
              <HistoryIcon size={52} className="mx-auto mb-4 text-primary/40 animate-pulse" />
              <p className="font-medium text-sm">{t('no_history')}</p>
            </motion.div>
          ) : scans.map((scan, index) => (
            <motion.div
              layout
              key={scan.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.4) }}
              whileHover={{ scale: 1.01 }}
            >
              <Card 
                className="border-none shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all rounded-xl bg-card text-card-foreground"
                onClick={() => navigate('/', { state: { historyItem: scan } })}
              >
                <CardContent className="p-0 flex h-24">
                  <div className="w-24 h-full shrink-0 relative bg-muted/65 group overflow-hidden">
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt={scan.foodName} className="object-cover w-full h-full transition-transform duration-500 hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HistoryIcon size={24} className="text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold truncate text-[15px] leading-tight text-foreground">{scan.foodName}</h3>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-semibold truncate">
                        {t('ai_disclaimer').split(/[-—]/)[0]}
                      </span>
                      {scan.confidence > 0 && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-semibold ml-2 shrink-0">
                           {Math.round(scan.confidence * 100)}% {language === 'he' ? 'התאמה' : 'Match'}
                        </span>
                      )}
                      <div className="flex-1" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(scan.id);
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        aria-label="Delete history entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
