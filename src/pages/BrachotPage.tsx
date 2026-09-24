import { useState, useEffect } from "react";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { brachotDatabase } from "../data/brachotDatabase";
import { useSettings } from "../contexts/SettingsContext";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function BrachotPage() {
  const { t, tradition, language } = useSettings();
  const [searchParams] = useSearchParams();
  const openParam = searchParams.get("open");
  const subtypeParam = searchParams.get("subtype");
  
  const isHe = language === 'he';
  const labelBefore = isHe ? 'ברכות ראשונות' : 'Before Eating';
  const labelAfter = isHe ? 'ברכות אחרונות' : 'After Eating';

  const [activeTab, setActiveTab] = useState<'before' | 'after'>(
    openParam && openParam.startsWith("after_") ? "after" : "before"
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(openParam);
  const [meeynShaloshSubtype, setMeeynShaloshSubtype] = useState<'grains' | 'wine' | 'fruits'>(
    (subtypeParam as 'grains' | 'wine' | 'fruits') || 'grains'
  );

  useEffect(() => {
    if (openParam) {
      setExpandedId(openParam);
      if (openParam.startsWith("after_")) {
        setActiveTab("after");
      } else {
        setActiveTab("before");
      }
      setTimeout(() => {
        const el = document.getElementById(`bracha-card-${openParam}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    }
  }, [openParam]);

  const filteredBrachot = brachotDatabase.filter((b) => {
    // Tab filter
    const matchesTab = activeTab === "after" ? b.type === "after" : b.type !== "after";
    
    // Search filter
    const matchesSearch = searchQuery === "" ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.english_translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.applies_to_foods?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Helper to dynamically format Me'eyn Shalosh text according to sub-option
  const foodTranslations: Record<string, string> = {
    'Apple': 'תפוח', 'Orange': 'תפוז', 'Grape': 'ענב', 'Nuts': 'אגוזים',
    'Potato': 'תפוח אדמה', 'Carrot': 'גזר', 'Tomato': 'עגבניה', 'Cucumber': 'מלפפון',
    'Cake': 'עוגה', 'Cookie': 'עוגיה', 'Pasta': 'פסטה', 'Cracker': 'קרקר',
    'Bread': 'לחם', 'Challah': 'חלה', 'Bagel': 'בייגל', 'Pita': 'פיתה',
    'Water': 'מים', 'Meat': 'בשר', 'Chicken': 'עוף', 'Fish': 'דג', 'Wine': 'יין', 'Grapes': 'ענבים', 'Dates': 'תמרים', 'Figs': 'תאנים'
  };

  const getFoodName = (food: string) => isHe ? (foodTranslations[food] || food) : food;
  const getTraditionName = (trad: string) => {
    if (!isHe) return trad;
    if (trad === 'ashkenazi') return 'אשכנזי';
    if (trad === 'sephardi') return 'ספרדי';
    if (trad === 'yemenite') return 'תימני';
    return trad;
  };
  const getCategoryName = (cat: string) => {
    if (!isHe) return cat;
    const catUpper = cat.toUpperCase();
    if (catUpper === "HA'ETZ") return "העץ";
    if (catUpper === "HA'ADAMA") return "האדמה";
    if (catUpper === "MEZONOT") return "מזונות";
    if (catUpper === "HAMOTZI") return "המוציא";
    if (catUpper === "SHEHAKOL") return "שהכל";
    if (catUpper === "BIRKAT HAMAZON") return "ברכת המזון";
    if (catUpper === "ME'EYN SHALOSH") return "מעין שלוש";
    if (catUpper === "BOREI NEFASHOT") return "בורא נפשות";
    return cat;
  };

  function getMeeynShaloshText(traditionText: string, subtype: 'grains' | 'wine' | 'fruits') {
    const lines = traditionText.split('\n');
    const resultLines: string[] = [];
    
    lines.forEach(line => {
      if (line.includes('(Grains):') || line.includes('(Grains/Cake):')) {
        if (subtype === 'grains') resultLines.push(line.replace(/-\s*\(Grains\):\s*/g, '').replace(/-\s*\(Grains\/Cake\):\s*/g, ''));
      } else if (line.includes('(Wine):')) {
        if (subtype === 'wine') resultLines.push(line.replace(/-\s*\(Wine\):\s*/g, ''));
      } else if (line.includes('(Fruits):') || line.includes('(Wine/Fruits):')) {
        if (subtype === 'fruits' || (subtype === 'wine' && line.includes('(Wine/Fruits):'))) {
          resultLines.push(line.replace(/-\s*\(Fruits\):\s*/g, '').replace(/-\s*\(Wine\/Fruits\):\s*/g, ''));
        }
      } else if (line.includes('(הַמִּחְיָה / פְּרִי הַגֶּפֶן / הַפֵּרוֹת)')) {
        const replacement = subtype === 'grains' ? 'הַמִּחְיָה' : subtype === 'wine' ? 'פְּרִי הַגֶּפֶן' : 'הַפֵּרוֹת';
        resultLines.push(line.replace('(הַמִּחְיָה / פְּרִי הַגֶּפֶן / הַפֵּרוֹת)', replacement));
      } else if (line.includes('(הַמִּחְיָה / פֵּרוֹתֶיהָ)')) {
        const replacement = subtype === 'grains' ? 'הַמִּחְיָה' : 'פֵּרוֹתֶיהָ';
        resultLines.push(line.replace('(הַמִּחְיָה / פֵּרוֹתֶיהָ)', replacement));
      } else {
        resultLines.push(line);
      }
    });
    
    return resultLines.join('\n');
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-24"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">
          {activeTab === 'after' ? (isHe ? 'ברכות אחרונות' : 'After-Blessings Library') : t('brachot_title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {activeTab === 'after' 
            ? (isHe ? 'ברכו את הבורא לאחר האכילה' : 'Find the correct blessing to recite after eating or drinking.') 
            : t('brachot_sub')}
        </p>
      </div>

      {/* TABS CONTROLLER */}
      <div className="grid grid-cols-2 p-1 bg-muted rounded-xl">
        <button
          onClick={() => {
            setActiveTab("before");
            setExpandedId(null);
          }}
          className={`py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === "before"
              ? "bg-card text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {labelBefore}
        </button>
        <button
          onClick={() => {
            setActiveTab("after");
            setExpandedId(null);
          }}
          className={`py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === "after"
              ? "bg-card text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {labelAfter}
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-pulse" size={20} />
        <Input
          type="search"
          placeholder={t('search_placeholder')}
          className="pl-10 rounded-xl bg-card border-none shadow-sm transition-shadow focus-visible:ring-1 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LIST OF CARDS */}
      <div className="space-y-4">
        {filteredBrachot.map((bracha) => {
          const isCurrentExpanded = expandedId === bracha.id;
          const showSubtypeSelector = bracha.isMeeynShalosh === true && isCurrentExpanded;
          
          let rawText = bracha.traditions[tradition]?.text || bracha.hebrew_text;
          if (bracha.isMeeynShalosh && rawText) {
            rawText = getMeeynShaloshText(rawText, meeynShaloshSubtype);
          }

          return (
            <motion.div 
              layout
              id={`bracha-card-${bracha.id}`}
              key={bracha.id} 
              className={`border-none rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer bg-card text-card-foreground ${
                isCurrentExpanded ? 'ring-2 ring-primary bg-card/95' : ''
              }`}
              onClick={() => setExpandedId(isCurrentExpanded ? null : bracha.id)}
              whileHover={{ scale: 1.01, y: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className={`w-2 transition-colors ${
                    isCurrentExpanded ? 'bg-primary' : 'bg-secondary group-hover:bg-primary'
                  }`}></div>
                  <div className="p-5 flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">
                        {getCategoryName(bracha.category)}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase font-medium">
                        {getTraditionName(tradition)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <span className="font-semibold">{t('eg')}</span> {bracha.applies_to_foods?.slice(0, 4).map(getFoodName).join(", ")}
                      </p>
                      
                      {/* Subtype Selector inside Me'eyn Shalosh (Al Hamichya) */}
                      {showSubtypeSelector && (
                        <div className="flex gap-2 p-1 bg-muted/80 rounded-lg my-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setMeeynShaloshSubtype('grains')}
                            className={`flex-1 py-1 text-xs rounded-md transition ${
                              meeynShaloshSubtype === 'grains' ? 'bg-primary text-white shadow-sm font-medium' : 'text-foreground/80 hover:bg-muted'
                            }`}
                          >
                            🌾 {isHe ? 'דגן' : 'Grains'}
                          </button>
                          <button
                            onClick={() => setMeeynShaloshSubtype('wine')}
                            className={`flex-1 py-1 text-xs rounded-md transition ${
                              meeynShaloshSubtype === 'wine' ? 'bg-primary text-white shadow-sm font-medium' : 'text-foreground/80 hover:bg-muted'
                            }`}
                          >
                            🍇 {isHe ? 'יין' : 'Wine'}
                          </button>
                          <button
                            onClick={() => setMeeynShaloshSubtype('fruits')}
                            className={`flex-1 py-1 text-xs rounded-md transition ${
                              meeynShaloshSubtype === 'fruits' ? 'bg-primary text-white shadow-sm font-medium' : 'text-foreground/80 hover:bg-muted'
                            }`}
                          >
                            🌳 {isHe ? 'פירות' : 'Fruits'}
                          </button>
                        </div>
                      )}

                      <h3 className="text-xl md:text-2xl font-hebrew text-foreground font-bold mb-1 leading-relaxed text-right whitespace-pre-wrap" dir="rtl">
                        {isCurrentExpanded ? rawText : bracha.hebrew_text}
                      </h3>
                    </div>
                    
                    <AnimatePresence>
                      {isCurrentExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="pt-3 border-t border-border mt-3 space-y-3 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">{bracha.transliteration}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{bracha.english_translation}</p>
                          </div>

                          {bracha.definition && (
                            <div className="text-xs text-foreground/75 bg-muted/30 p-2.5 rounded-lg border border-border/40">
                              <span className="font-semibold uppercase tracking-wider block mb-1 text-[10px] text-muted-foreground">Definition</span>
                              {bracha.definition}
                            </div>
                          )}

                          <div className="bg-muted p-4 rounded-xl space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                              <Sparkles size={14} />
                              {t('how_to_eat')}
                            </h4>
                            <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                              {bracha.instructions[language as keyof typeof bracha.instructions] || bracha.instructions.en}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          );
        })}
        
        {filteredBrachot.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p>{isHe ? "לא נמצאו ברכות התואמות את החיפוש." : "No blessings found matching your search."}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
