import { getSafeAppCheckToken } from "../lib/firebase";
import React, {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  useEffect,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Save,
  Info,
  Check,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SYSTEM_PROMPT, buildUserMessage } from "../components/geminiPrompt";
import { brachotDatabase } from "../data/brachotDatabase";
import { GROUNDING_FOODS_DB } from "../data/groundingFoods";
import { useSettings } from "../contexts/SettingsContext";
import { useScan } from "../contexts/ScanContext";
import { auth, app } from "../lib/firebaseAuth";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { getCachedToken, db } from "../lib/firebaseAuth";
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, getDocs } from "firebase/firestore";
import { isIngredientInDatabase } from "../../foodDatabase";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { getDeviceId } from "../lib/deviceId";

const FLAG_MESSAGES: Record<string, string> = {
  safek:
    "Traditional doubt (Safek) exists. When in doubt, follow instructions carefully.",
  ikar_tafel:
    "Primary (Ikar) and subordinate (Tafel) components detected. Read instructions on which blessing handles both.",
  shinui_makom:
    "Change of place requires attention to details specified below.",
  hefsek: "Be careful of interruptions during/between blessings.",
  birkat_hamazon_covers_mezonot:
    "Mezonot is covered under certain meal conditions (e.g. Birkat HaMazon). Detailed below.",
};

function mapRishonaToCategory(rishona: string): string {
  const r = rishona.toLowerCase();
  if (r.includes("hamotzi") || r.includes("המוציא")) return "hamotzi";
  if (r.includes("mezonot") || r.includes("מזונות")) return "mezonot";
  if (r.includes("hagefen") || r.includes("הגפן")) return "hagefen";
  if (r.includes("haetz") || r.includes("העץ")) return "haetz";
  if (r.includes("haadama") || r.includes("האדמה")) return "haadama";
  return "shehakol";
}

function parseInstructionSteps(items: any): string[] {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  const results: string[] = [];
  for (const item of list) {
    if (!item) continue;
    const str = typeof item === "string" ? item : item.text || String(item);
    const parts = str
      .split(/(?:\r?\n\s*)+(?=(?:\d+[\.\)]|\-|\*|\bStep\s*\d+:?)\s+)/i)
      .flatMap((p: string) => p.split(/\r?\n\r?\n+/))
      .map((p: string) => p.trim())
      .filter(Boolean);

    for (let part of parts) {
      part = part.replace(/^(?:Step\s*\d+[:\-.]?|\d+[\.\)]|\-|\*)\s+/i, "").trim();
      if (part) results.push(part);
    }
  }
  return results.length > 0
    ? results
    : Array.isArray(items)
      ? items.map(String).filter(Boolean)
      : [String(items)];
}

const compressImageBase64 = (
  base64Str: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

interface LookupItem {
  keys: string[];
  foodNameEn: string;
  foodNameHe: string;
  primaryBracha: string;
  requiresMultipleBlessings: boolean;
  steps: {
    is_conditional: boolean;
    text?: string;
    condition_question?: string;
    paths?: any[];
  }[];
  afterBlessings: string[];
}

const COMMON_FOODS_LOOKUP: LookupItem[] = [
  {
    keys: ["water", "מים", "water drink"],
    foodNameEn: "Water",
    foodNameHe: "מים",
    primaryBracha: "shehakol",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Recite the [Shehakol](#bracha-shehakol) blessing and drink. Make sure you are not drinking solely for swallowing food.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you drank at least 86ml (Revi'it) of water in a quick gulp.",
    ],
  },
  {
    keys: ["bread", "לחם", "challah", "חלה", "bagel", "בייגל", "pita", "פיתה"],
    foodNameEn: "Bread / Challah",
    foodNameHe: "לחם / חלה",
    primaryBracha: "hamotzi",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "1. Perform Netilat Yadayim (ritual hand washing) with a blessing.\n2. Dry your hands and do not speak.\n3. Take the bread, say [HaMotzi](#bracha-hamotzi), dip in salt, and eat.",
      },
    ],
    afterBlessings: [
      "Recite the full [Birkat Hamazon](#bracha-birkat-hamazon) after the meal.",
    ],
  },
  {
    keys: ["apple", "תפוח", "apples", "תפוחים"],
    foodNameEn: "Apple",
    foodNameHe: "תפוח",
    primaryBracha: "haetz",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaEtz](#bracha-haetz) and eat. If there is a worm check, verify before eating.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["banana", "בננה", "bananas", "בננות"],
    foodNameEn: "Banana",
    foodNameHe: "בננה",
    primaryBracha: "haadama",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaAdama](#bracha-haadama) and eat. Although bananas grow on trees, the plant is botanical grass (shrub) so the blessing is HaAdama.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["cookie", "עוגייה", "עוגיה", "cookies", "עוגיות"],
    foodNameEn: "Cookie",
    foodNameHe: "עוגייה",
    primaryBracha: "mezonot",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Mezonot](#bracha-mezonot) and eat. If you consume a massive quantity (equivalent to a meal), it might require washing like bread.",
      },
    ],
    afterBlessings: [
      "Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["chocolate", "שוקולד", "dark chocolate", "milk chocolate"],
    foodNameEn: "Chocolate",
    foodNameHe: "שוקולד",
    primaryBracha: "shehakol",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Shehakol](#bracha-shehakol) and eat. Although cocoa grows on trees, processed cocoa loses its form and is therefore Shehakol.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["coffee", "קפה", "iced coffee", "espresso", "latte"],
    foodNameEn: "Coffee",
    foodNameHe: "קפה",
    primaryBracha: "shehakol",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Shehakol](#bracha-shehakol) and drink.",
      },
    ],
    afterBlessings: [
      "Normally, a hot coffee is sipped slowly and does not require an after-blessing. If drank cold or quickly (86ml), say [Borei Nefashot](#bracha-borei-nefashot).",
    ],
  },
  {
    keys: ["pizza", "פיצה", "pizza slice", "slices of pizza"],
    foodNameEn: "Pizza",
    foodNameHe: "פיצה",
    primaryBracha: "mezonot",
    requiresMultipleBlessings: true,
    steps: [
      {
        is_conditional: true,
        condition_question: "How many slices are you eating?",
        paths: [
          {
            label: "Snacking on 1 slice",
            text: "Say [Mezonot](#bracha-mezonot) and eat the slice.",
            after_blessings: [
              "Say [Al HaMichya](#bracha-al-hamichya) afterward.",
            ],
          },
          {
            label: "Eating 2 or more slices (Meal option)",
            text: "Washing hands with blessing (Netilat Yadayim) is required. Say [HaMotzi](#bracha-hamotzi) instead, as this constitutes a full meal.",
            after_blessings: [
              "Say [Birkat Hamazon](#bracha-birkat-hamazon) afterward.",
            ],
          },
        ],
      },
    ],
    afterBlessings: [],
  },
  {
    keys: ["orange", "תפוז", "oranges", "clementine", "קלמנטינה"],
    foodNameEn: "Orange",
    foodNameHe: "תפוז",
    primaryBracha: "haetz",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaEtz](#bracha-haetz) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["potato", "תפוח אדמה", "potatoes", "chips", "צ'יפס", "french fries"],
    foodNameEn: "Potato / Fries",
    foodNameHe: "תפוח אדמה / צ'יפס",
    primaryBracha: "haadama",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaAdama](#bracha-haadama) and eat. Potato chips or french fries remain HaAdama as they retain their distinct potato identity.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["rice", "אורז", "white rice", "brown rice"],
    foodNameEn: "Rice",
    foodNameHe: "אורז",
    primaryBracha: "mezonot",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Mezonot](#bracha-mezonot) and eat. Rice is a unique grain that gets Mezonot but does NOT require Al HaMichya afterward.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) after eating rice (if a Kezayit was consumed).",
    ],
  },
  {
    keys: ["wine", "יין", "grape juice", "מיץ ענבים"],
    foodNameEn: "Wine / Grape Juice",
    foodNameHe: "יין / מיץ ענבים",
    primaryBracha: "hagefen",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaGafen](#bracha-hagefen) and drink.",
      },
    ],
    afterBlessings: [
      "Recite [Al HaGefen](#bracha-al-hamichya) afterward if you drank a Revi'it (~86ml) in a quick swallow.",
    ],
  },
  {
    keys: ["grape", "ענב", "grapes", "ענבים"],
    foodNameEn: "Grapes",
    foodNameHe: "ענבים",
    primaryBracha: "haetz",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaEtz](#bracha-haetz) and eat. Grapes are one of the Seven Species.",
      },
    ],
    afterBlessings: [
      "Recite [Al Ha'etz](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["carrot", "גזר", "carrots", "גזרים"],
    foodNameEn: "Carrot",
    foodNameHe: "גזר",
    primaryBracha: "haadama",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaAdama](#bracha-haadama) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["cake", "עוגה", "cakes", "עוגות"],
    foodNameEn: "Cake",
    foodNameHe: "עוגה",
    primaryBracha: "mezonot",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Mezonot](#bracha-mezonot) and eat. If cake is eaten as part of a meal where bread is also consumed, the bread covers the cake.",
      },
    ],
    afterBlessings: [
      "Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["chicken", "עוף", "chicken breast", "roasted chicken"],
    foodNameEn: "Chicken",
    foodNameHe: "עוף",
    primaryBracha: "shehakol",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Shehakol](#bracha-shehakol) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["meat", "בשר", "steak", "beef", "סטייק"],
    foodNameEn: "Meat / Beef",
    foodNameHe: "בשר / סטייק",
    primaryBracha: "shehakol",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Shehakol](#bracha-shehakol) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["cucumber", "מלפפון", "cucumbers", "מלפפונים"],
    foodNameEn: "Cucumber",
    foodNameHe: "מלפפון",
    primaryBracha: "haadama",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaAdama](#bracha-haadama) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: [
      "pasta",
      "פסטה",
      "macaroni",
      "spaghetti",
      "ספגטי",
      "noodles",
      "נודלס",
    ],
    foodNameEn: "Pasta",
    foodNameHe: "פסטה",
    primaryBracha: "mezonot",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [Mezonot](#bracha-mezonot) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g).",
    ],
  },
  {
    keys: ["tomato", "עגבנייה", "עגבניה", "tomatoes", "עגבניות"],
    foodNameEn: "Tomato",
    foodNameHe: "עגבניה",
    primaryBracha: "haadama",
    requiresMultipleBlessings: false,
    steps: [
      {
        is_conditional: false,
        text: "Say [HaAdama](#bracha-haadama) and eat.",
      },
    ],
    afterBlessings: [
      "Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g).",
    ],
  },
];

export function renderMarkdownLinks(text: string): React.ReactNode {
  if (!text) return "";

  // Fix double brackets that the model sometimes generates e.g. [[Mezonot](#bracha-mezonot)](#bracha-mezonot)
  const cleanedText = text.replace(/\[\s*\[([^\]]+)\]\s*\([^)]+\)\s*\]\s*\(([^)]+)\)/g, '[$1]($2)')
                          .replace(/\[([^\]]+)\]\s*\([^)]+\)\s*\]\s*\(([^)]+)\)/g, '[$1]($2)')
                          .replace(/\[\s*\[([^\]]+)\]\s*\(([^)]+)\)/g, '[$1]($2)');

  // Format md links: [text](#bracha-id) or [text](bracha-id)
  const mdRegex = /\[([^\]]+)\]\s*\(#?bracha-([a-zA-Z0-9_-]+)\)/g;
  let matches = [];
  let match;
  while ((match = mdRegex.exec(cleanedText)) !== null) {
    matches.push({
      full: match[0],
      text: match[1],
      id: match[2],
      index: match.index,
    });
  }

  if (matches.length > 0) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Reset regex index and scan
    mdRegex.lastIndex = 0;
    while ((match = mdRegex.exec(cleanedText)) !== null) {
      const matchIndex = match.index;
      const linkText = match[1];
      const brachaId = match[2];

      let mappedId = brachaId.includes("al-hamichya") || brachaId.includes("al-haetz") || brachaId.includes("al-hagefen")
        ? "after_al_hamichya"
        : brachaId.includes("borei-nefashot")
          ? "after_borei_nefashot"
          : brachaId.includes("birkat-hamazon") ||
              brachaId.includes("birkathamazon")
            ? "after_birkat_hamazon"
            : `bracha_${brachaId.replace("-", "_")}`;
      
      let finalPath = `/brachot?open=${mappedId}`;
      if (mappedId === "after_al_hamichya") {
        if (brachaId.includes("al-haetz")) {
          finalPath += "&subtype=fruits";
        } else if (brachaId.includes("al-hagefen")) {
          finalPath += "&subtype=wine";
        } else {
          finalPath += "&subtype=grains";
        }
      }

      if (matchIndex > lastIndex) {
        parts.push(cleanedText.substring(lastIndex, matchIndex));
      }

      parts.push(
        <Link
          key={`md-${matchIndex}`}
          to={finalPath}
          className="text-primary font-bold underline hover:text-primary/80 inline-flex items-center gap-0.5 mx-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {linkText} <ExternalLink size={12} className="inline opacity-80" />
        </Link>,
      );
      lastIndex = mdRegex.lastIndex;
    }

    if (lastIndex < cleanedText.length) {
      parts.push(cleanedText.substring(lastIndex));
    }

    return <>{parts}</>;
  }

  const parts = cleanedText.split(
    /(Birkat Hamazon|Al Hamichya|Al Hagefen|Al Ha'etz|Al HaEtz|Al hamichya|Al hagafen|Al ha'etz|Al haetz|Borei Nefashot|Borei nefashot|ברכת המזון|מעין שלוש|על המחיה|על המחיה והכלכלה|על הגפן|על העץ|בורא נפשות)/g,
  );
  return parts.map((part, index) => {
    const lower = part.toLowerCase();
    if (lower === "birkat hamazon" || part === "ברכת המזון") {
      return (
        <Link
          key={`legacy-${index}`}
          to="/brachot?open=after_birkat_hamazon"
          className="text-primary font-bold underline hover:text-primary/80 inline-flex items-center gap-0.5 mx-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {part} <ExternalLink size={12} className="inline opacity-80" />
        </Link>
      );
    } else if (
      lower === "al hamichya" ||
      lower === "al hagefen" ||
      lower === "al ha'etz" ||
      lower === "al haetz" ||
      lower === "al hagafen" ||
      part === "על המחיה" ||
      part === "על המחיה והכלכלה" ||
      part === "על הגפן" ||
      part === "על העץ" ||
      part === "מעין שלוש"
    ) {
      let finalPath = "/brachot?open=after_al_hamichya";
      if (lower === "al ha'etz" || lower === "al haetz" || part === "על העץ") {
        finalPath += "&subtype=fruits";
      } else if (lower === "al hagefen" || lower === "al hagafen" || part === "על הגפן") {
        finalPath += "&subtype=wine";
      } else {
        finalPath += "&subtype=grains";
      }

      return (
        <Link
          key={`legacy-${index}`}
          to={finalPath}
          className="text-primary font-bold underline hover:text-primary/80 inline-flex items-center gap-0.5 mx-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {part} <ExternalLink size={12} className="inline opacity-80" />
        </Link>
      );
    } else if (lower === "borei nefashot" || part === "בורא נפשות") {
      return (
        <Link
          key={`legacy-${index}`}
          to="/brachot?open=after_borei_nefashot"
          className="text-primary font-bold underline hover:text-primary/80 inline-flex items-center gap-0.5 mx-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {part} <ExternalLink size={12} className="inline opacity-80" />
        </Link>
      );
    }
    return part;
  });
}

const renderTextWithLinks = renderMarkdownLinks;

export default function ScanPage() {
  const { t, tradition, language } = useSettings();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const {
    imageSrc,
    setImageSrc,
    scanResult,
    setScanResult,
    isScanning,
    setIsScanning,
  } = useScan();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Record<number, number>>(
    {},
  );
  const [selectedBranch, setSelectedBranch] = useState(0);

  // Advanced settings scan inputs
  const [mealContext, setMealContext] = useState<"none" | "bread_meal">("none");
  const [userNotes, setUserNotes] = useState("");

  // Instant common food lookup state and handlers
  const [activeInputTab, setActiveInputTab] = useState<"camera" | "text">(
    "camera",
  );
  const [textQuery, setTextQuery] = useState("");
  const [textLookupError, setTextLookupError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isReportingMissing, setIsReportingMissing] = useState(false);
  const [missingReported, setMissingReported] = useState(false);

  // Dedications
  const [dedications, setDedications] = useState<any[]>([]);
  const [currentDedication, setCurrentDedication] = useState<any | null>(null);

  useEffect(() => {
    const fetchDedications = async () => {
      try {
        const q = query(collection(db, "blessing_dedications"));
        const snap = await getDocs(q);
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        // Filter out expired temporary dedications
        const now = Date.now();
        list = list.filter(d => {
          if (d.listType === 'temporary' && d.createdAt && d.durationDays) {
            const createdMs = d.createdAt.seconds * 1000;
            const expirationMs = createdMs + (d.durationDays * 24 * 60 * 60 * 1000);
            return now < expirationMs;
          }
          return true;
        });

        // Sort: temporary first, then permanent
        list.sort((a, b) => {
          if (a.listType !== 'permanent' && b.listType === 'permanent') return -1;
          if (a.listType === 'permanent' && b.listType !== 'permanent') return 1;
          return 0; // maintain relative order, or could sort by date
        });

        if (list.length > 0) {
          setDedications(list);
        }
      } catch (e) {
        console.error("Failed to fetch dedications", e);
      }
    };
    fetchDedications();
  }, []);

  // Cycle dedications while scanning
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isScanning && dedications.length > 0) {
      const cycleDedication = () => {
        const idxStr = localStorage.getItem("dedication_index") || "0";
        let idx = parseInt(idxStr, 10);
        if (isNaN(idx) || idx >= dedications.length) {
          idx = 0;
        }
        setCurrentDedication({ ...dedications[idx], cycleKey: Date.now() }); // Unique key for animation
        localStorage.setItem("dedication_index", (idx + 1).toString());
      };

      cycleDedication(); // Set immediately
      
      intervalId = setInterval(() => {
        cycleDedication();
      }, 3000);
    } else {
      setCurrentDedication(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, dedications]);

  useEffect(() => {
    let active = true;
    let currentStream: MediaStream | null = null;
    setCameraError(null);

    async function startCamera() {
      if (activeInputTab !== "camera" || scanResult) {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (active) {
          setCameraError(
            language === "he"
              ? "גישה למצלמה אינה נתמכת בסביבה או בדפדפן זה. באפשרותך לחפש לפי שם."
              : "Camera access is not supported or permission was denied. Try opening the app in a new tab, or you can search by name.",
          );
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 600 },
            height: { ideal: 800 },
          },
          audio: false,
        });
        if (active) {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraStream(stream);
          currentStream = stream;
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn("Could not start environment camera, trying default", err);
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("navigator.mediaDevices not available");
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (active) {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setCameraStream(stream);
            currentStream = stream;
          } else {
            stream.getTracks().forEach((track) => track.stop());
          }
        } catch (e2) {
          console.error("Camera access failed completely", e2);
          if (active) {
            const errName = e2 instanceof Error ? e2.name : "";
            const errMsg = e2 instanceof Error ? e2.message : String(e2);
            if (errName === "NotAllowedError" || errMsg.includes("Permission denied")) {
              setCameraError(
                language === "he"
                  ? "הגישה למצלמה נדחתה. יש לאשר הרשאות מצלמה בהגדרות הדפדפן."
                  : "Camera access was denied. Please allow camera permissions or try opening the app in a new tab.",
              );
            } else {
              setCameraError(errMsg);
            }
          }
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeInputTab, scanResult]);

  const handleSelectCommonFood = (foodName: string) => {
    if (textLookupError) setTextLookupError(null);
    setTimeout(() => {
      runInstantLookup(foodName);
    }, 50);
  };

  const handleTextQuerySearch = () => {
    const q = textQuery.trim();
    if (!q) return;
    runInstantLookup(q);
  };

  const handleReportMissingFood = async () => {
    const q = textQuery.trim();
    if (!q) return;
    if (isReportingMissing) return;

    setIsReportingMissing(true);
    try {
      await addDoc(collection(db, "reported_missing_foods"), {
        foodName: q,
        reportedAt: serverTimestamp(),
      });
      setMissingReported(true);
      setTimeout(() => {
        setMissingReported(false);
        setTextLookupError(null);
        setTextQuery("");
      }, 3000);
    } catch (e: any) {
      console.error("Failed to report missing food:", e);
      alert("Failed to report. Please try again later.");
    } finally {
      setIsReportingMissing(false);
    }
  };

  const runInstantLookup = async (queryText: string) => {
    const term = queryText.toLowerCase().trim();

    // Check if it matches our foods lookup array
    const matched = GROUNDING_FOODS_DB.find((item) => {
      return item.keys.some(
        (k) => k === term || term.includes(k) || k.includes(term),
      );
    });

    if (matched) {
      setIsScanning(true);
      setScanResult(null);
      setSelectedPaths({});
      setSelectedBranch(0);
      setHasGivenFeedbackForThisScan(false);

      // Transition loading effects (350ms)
      await new Promise((resolve) => setTimeout(resolve, 350));

      const computedBracha = matched.primaryBracha;
      const dbEntry = brachotDatabase.find(
        (b) => b.category.toLowerCase() === computedBracha.toLowerCase(),
      );

      let rawMarkdown = `**Identified Food:** ${matched.nameEn}\n**Meal Type:** Individual item\n\n**Step-by-Step Eating Order:**\n`;
      (matched.steps || []).forEach((step: any, idx: number) => {
        if (step.is_conditional) {
          rawMarkdown += `*Branching Choice: ${step.condition_question}*\n`;
          (step.paths || []).forEach((p: any) => {
            if (p.steps && Array.isArray(p.steps)) {
              rawMarkdown += `- **${p.label}**:\n`;
              p.steps.forEach((s: string, sIdx: number) => {
                rawMarkdown += `  ${sIdx + 1}. ${s}\n`;
              });
            } else {
              rawMarkdown += `- **${p.label}**: ${p.text}\n`;
            }
          });
        } else {
          rawMarkdown += `${idx + 1}. ${step.text}\n`;
        }
      });

      if (matched.afterBlessings && matched.afterBlessings.length > 0) {
        rawMarkdown += `\n**Bracha Acharona Guidelines:**\n`;
        matched.afterBlessings.forEach((ab: string) => {
          rawMarkdown += `- ${ab}\n`;
        });
      }

      let newResult: any = {
        name: language === "he" ? matched.nameHe : matched.nameEn,
        bracha: computedBracha,
        confidence: 1.0,
        imageUrl: "/icon-192.png",
        requires_multiple_blessings: false,
        isExtended: true,
        markdown_result: rawMarkdown,
        details: dbEntry,
      };

      if (language === "he") {
        try {
          // Just let gemini translate the whole markdown if needed, but for instant we could use a single fast translate call.
          // Since the translating endpoint expects an object, let's adapt it to use markdown translator.
          // Actually, we can just fetch to a new simple translation endpoint for text.
          const tRes = await fetch("/api/translate-lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || ""), "X-Firebase-AppCheck": await getSafeAppCheckToken() },
            body: JSON.stringify({
              markdown_text: newResult.markdown_result,
              targetLanguage: "he",
            }),
          });
          if (tRes.ok) {
            const translatedData = await tRes.json();
            newResult.markdown_result = translatedData.markdown_result;
          }
        } catch (e) {
          console.error("Translation lookup failed", e);
        }
      }

      setImageSrc("/icon-192.png");
      setScanResult(newResult as any);
      setIsScanning(false);

      // Save to local scan log hist
      await handleSaveToHistory({
        ...newResult,
        imageUrl: "/icon-192.png",
      } as any, true);
    } else {
      setTextLookupError(
        language === "he"
          ? "מצטערים, המאכל הזה כרגע לא נמצא ברשימה שלנו של המאכלים הניתנים לחיפוש מהיר."
          : "Sorry, this food is not currently in our fast-search database.",
      );
    }
  };

  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"down" | "feedback" | null>(
    null,
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [hasGivenFeedbackForThisScan, setHasGivenFeedbackForThisScan] =
    useState(false);
  const [currentScanDocId, setCurrentScanDocId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.historyItem) {
      const item = location.state.historyItem;
      setImageSrc(item.imageUrl);
      const isExtended = item.isExtended || false;
      const steps = isExtended ? item.items || [] : null;
      const afterBlessings = isExtended
        ? item.meal_summary?.after_blessings || []
        : null;

      setScanResult({
        name: item.foodName,
        bracha: item.brachaCategory,
        confidence: item.confidence,
        imageUrl: item.imageUrl,
        requires_multiple_blessings: item.requires_multiple_blessings || false,
        how_to_eat_instructions_en: item.how_to_eat_instructions_en,
        how_to_eat_instructions_he: item.how_to_eat_instructions_he,
        isExtended: isExtended,
        steps: steps,
        after_blessings: afterBlessings,
        has_branches: item.has_branches || false,
        branch_question: item.branch_question || null,
        branches: item.branches || [],
        markdown_result: item.markdown_result || "",
        details: item.details || brachotDatabase.find(
          (b) => b.category === item.brachaCategory,
        ),
      });
      setHasGivenFeedbackForThisScan(false);
    }
  }, [location.state]);

  const capture = useCallback(() => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 800;
        canvas.height = video.videoHeight || 800;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = canvas.toDataURL("image/jpeg", 0.85);
          setImageSrc(image);
          analyzeImage(image);
        }
      } catch (err) {
        console.error("Failed to capture image", err);
      }
    }
  }, [videoRef, cameraStream]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImageBase64(base64, 512, 512, 0.6);
          setImageSrc(compressed);
          analyzeImage(compressed);
        } catch (err) {
          setImageSrc(base64);
          analyzeImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);
    setSelectedPaths({});
    setHasGivenFeedbackForThisScan(false);

    try {
      // Part 1: Client-Side Image Pre-Processing (System-Level)
      // Downscale to a maximum dimension of 512px (preserving details) and compress to JPEG at 0.6 quality.
      const compressedBase64 = await compressImageBase64(
        base64Image,
        512,
        512,
        0.6,
      );
      setImageSrc(compressedBase64); // update preview image state

      const base64Data = compressedBase64.split(",")[1];

      // Step 1: Call Single Stage Scan API
      const finalNotes = userNotes ? userNotes + " " : "";
      const scanResponse = await fetch("/api/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || ""), "X-Firebase-AppCheck": await getSafeAppCheckToken() },
        body: JSON.stringify({
          base64Data,
          notes: finalNotes,
          minhag: tradition,
          context: mealContext,
          language,
          userId: user?.uid,
          deviceId: getDeviceId(),
        }),
      });

      if (!scanResponse.ok) {
        let errorText = "";
        try {
          const contentType = scanResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errObj = await scanResponse.json();
            errorText = errObj.error || JSON.stringify(errObj);
          } else {
            errorText = await scanResponse.text();
          }
        } catch (e) {
          errorText = "Unknown error occurred";
        }

        throw new Error(
          `Server returned ${scanResponse.status}: ${errorText.substring(0, 100)}...`,
        );
      }

      const responseText = await scanResponse.text();
      let scanData;
      try {
        scanData = JSON.parse(responseText);
      } catch (err: any) {
        if (
          responseText.includes("<!doctype html>") ||
          responseText.includes("<html")
        ) {
          throw new Error(
            "Server returned an HTML page instead of JSON. The route may not be matched or the server exceeded memory limits.",
          );
        }
        throw new Error(`Invalid JSON from server: ${err.message}`);
      }

      const finalParsed = scanData.result;

      if (!finalParsed) {
        throw new Error("No parsed result found in the response JSON.");
      }

      

      const computedBracha = (
        finalParsed.primary_bracha || "shehakol"
      ).toLowerCase();
      const dbEntry = brachotDatabase.find(
        (b) => b.category === computedBracha,
      );

      const itemsList = finalParsed.identified_items || [];
      const foodName = itemsList.length > 0 ? itemsList.join(", ") : "Identified Meal";

      const newResult = {
        name: foodName,
        bracha: computedBracha,
        confidence: 0,
        imageUrl: base64Image,
        requires_multiple_blessings: finalParsed.has_branches || false,
        isExtended: true,
        markdown_result: "",
        has_branches: finalParsed.has_branches || false,
        branch_question: finalParsed.branch_question || null,
        branches: finalParsed.branches || [],
        steps: finalParsed.steps || [],
        after_blessings: finalParsed.after_blessings || [],
        details: dbEntry,
      };

      setScanResult(newResult);
      await handleSaveToHistory(newResult);
    } catch (err: any) {
      console.error("Error analyzing image:", err);

      const friendlyErrMsg =
        err.message.length < 200
          ? err.message
          : "We encountered an issue during analysis. Please check your network or try again.";

      setScanError(friendlyErrMsg);
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToHistory = async (
    resultToSave: typeof scanResult,
    isFromSearch: boolean = false
  ) => {
    if (!resultToSave) return;
    setIsSaving(true);
    try {
      const mappedSteps = resultToSave.isExtended ? resultToSave.steps : [];
      const mappedSummary = resultToSave.isExtended
        ? { after_blessings: resultToSave.after_blessings || [] }
        : null;

      const newHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        foodName: resultToSave.name || "Identified Meal",
        brachaCategory: resultToSave.bracha,
        confidence: resultToSave.confidence || 0,
        imageUrl: resultToSave.imageUrl,
        createdAt: Date.now(),
        requires_multiple_blessings:
          resultToSave.requires_multiple_blessings || false,
        how_to_eat_instructions_en:
          resultToSave.how_to_eat_instructions_en || "",
        how_to_eat_instructions_he:
          resultToSave.how_to_eat_instructions_he || "",
        isExtended: resultToSave.isExtended || false,
        items: mappedSteps,
        meal_summary: mappedSummary,
        has_branches: resultToSave.has_branches || false,
        branch_question: resultToSave.branch_question || null,
        branches: resultToSave.branches || [],
        markdown_result: resultToSave.markdown_result || "",
        details: resultToSave.details || null
      };

      const existingHistoryStr = localStorage.getItem("scans_history");
      let history = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      history.unshift(newHistoryItem);

      if (history.length > 8) {
        history = history.slice(0, 8);
      }

      localStorage.setItem("scans_history", JSON.stringify(history));
      console.log("Successfully saved scan to local history.");

      const finalImage = resultToSave.imageUrl || imageSrc;
      if (!isFromSearch && finalImage && finalImage !== "/icon-192.png") {
        try {
          const docRef = await addDoc(collection(db, "scans"), {
            userId: user?.uid || "anonymous",
            createdAt: serverTimestamp(),
            timestamp: serverTimestamp(),
            name: resultToSave.name || "Identified Meal",
            imageUrl: finalImage || null,
            tradition: tradition,
            instructions: resultToSave.branches || resultToSave.markdown_result || [],
          });
          setCurrentScanDocId(docRef.id);
        } catch (e: any) {
          console.error("Failed to save to cloud scans collection", e);
        }
      }
    } catch (error: any) {
      console.error("Could not save to history:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveAfterBlessings = (): string[] => {
    if (!scanResult) return [];

    let pathBlessings: string[] = [];
    let hasPathBlessings = false;

    if (scanResult.steps) {
      scanResult.steps.forEach((step: any, idx: number) => {
        if (step.is_conditional) {
          const selectedPathIdx = selectedPaths[idx] ?? 0;
          const selectedPath = step.paths?.[selectedPathIdx];
          if (
            selectedPath &&
            selectedPath.after_blessings &&
            selectedPath.after_blessings.length > 0
          ) {
            pathBlessings = [...pathBlessings, ...selectedPath.after_blessings];
            hasPathBlessings = true;
          }
        }
      });
    }

    if (hasPathBlessings) {
      return pathBlessings;
    }
    return scanResult.after_blessings || [];
  };

  const handleFeedback = async (type: "up" | "down") => {
    if (!scanResult) return;

    if (type === "up") {
      try {
        const feedback = {
          foodDetected: (scanResult.name || "Identified Meal").substring(
            0,
            200,
          ),
          confidence: scanResult.confidence || 0,
          language: language.substring(0, 10),
          tradition: tradition.substring(0, 20),
          timestamp: Date.now(),
          type: "up",
          imageUrl: imageSrc || "",
          id: Math.random().toString(36).substr(2, 9),
        };
        const existing = localStorage.getItem("feedbacks") || "[]";
        localStorage.setItem(
          "feedbacks",
          JSON.stringify([...JSON.parse(existing), feedback]),
        );
        if (currentScanDocId) {
          try {
            await updateDoc(doc(db, "scans", currentScanDocId), {
              feedbackType: "up"
            });
          } catch (e) {
            console.error(e);
          }
        }
        setFeedbackSuccess(true);
        setHasGivenFeedbackForThisScan(true);
        setTimeout(() => setFeedbackSuccess(false), 4000);
      } catch (error: any) {
        console.error("Failed to save thumbs-up feedback:", error);
      }
    } else {
      setFeedbackType("down");
      setShowFeedbackModal(true);
    }
  };

  const submitFeedbackText = async () => {
    if (!scanResult) return;
    const text = feedbackText.trim();
    if (!text) return;

    try {
      const feedback = {
        foodDetected: (scanResult.name || "Identified Meal").substring(0, 200),
        confidence: scanResult.confidence || 0,
        language: language.substring(0, 10),
        tradition: tradition.substring(0, 20),
        timestamp: Date.now(),
        type: "down",
        explanation: text.substring(0, 1000),
        imageUrl: imageSrc || "",
        id: Math.random().toString(36).substr(2, 9),
      };
      const existing = localStorage.getItem("feedbacks") || "[]";
      localStorage.setItem(
        "feedbacks",
        JSON.stringify([...JSON.parse(existing), feedback]),
      );
      if (currentScanDocId) {
        try {
          await updateDoc(doc(db, "scans", currentScanDocId), {
            feedbackType: "down",
            feedbackText: text
          });
        } catch (e) {
          console.error(e);
        }
      }
      setFeedbackSuccess(true);
      setHasGivenFeedbackForThisScan(true);
      setShowFeedbackModal(false);
      setFeedbackText("");
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (error: any) {
      console.error("Failed to submit thumbs-down feedback:", error);
    }
  };

  const retake = () => {
    setImageSrc(null);
    setScanResult(null);
    setSelectedPaths({});
    setHasGivenFeedbackForThisScan(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-start min-h-full pt-[env(safe-area-inset-top,1rem)] p-4 relative w-full"
      id="scan-page-root"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {!imageSrc && !isScanning ? (
            <motion.div
              key="scan-input-menu"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-4"
            >
              {/* Beautiful App Title and Branding Logo */}
              <div className="flex flex-col items-center justify-center py-2 animate-in fade-in duration-500">
                <Logo size={95} variant="full" />
              </div>

              {/* Input Method Tabs Switcher */}
              <div className="grid grid-cols-2 p-1 bg-muted rounded-xl w-full">
                <button
                  onClick={() => {
                    setActiveInputTab("camera");
                    if (textLookupError) setTextLookupError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeInputTab === "camera"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {language === "he" ? "📷 מצלמת סורק" : "📷 Scanner Camera"}
                </button>
                <button
                  onClick={() => {
                    setActiveInputTab("text");
                    if (textLookupError) setTextLookupError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeInputTab === "text"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {language === "he"
                    ? "✍️ חיפוש לפי שם"
                    : "✍️ Search Food By Name"}
                </button>
              </div>

              {textLookupError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl text-start flex flex-col gap-2 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle
                      className="shrink-0 mt-0.5 animate-pulse"
                      size={16}
                    />
                    <span className="font-semibold">{textLookupError}</span>
                  </div>
                  {missingReported ? (
                    <div className="text-green-600 font-medium flex items-center gap-1 mt-1">
                      <Check size={14} />
                      {language === "he"
                        ? "תודה! הדיווח נשלח."
                        : "Thank you! Report sent."}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start mt-1 text-xs py-1 h-8"
                      onClick={handleReportMissingFood}
                      disabled={isReportingMissing}
                    >
                      {isReportingMissing ? (
                        <RefreshCw size={14} className="animate-spin mr-1.5" />
                      ) : null}
                      {language === "he"
                        ? "דווח על מאכל חסר"
                        : "Report Missing Food"}
                    </Button>
                  )}
                </div>
              )}

              {activeInputTab === "camera" ? (
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-lg ring-1 ring-border">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/40 m-2 rounded-xl flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-white/50 rounded-full animate-pulse" />
                  </div>

                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/95 text-white text-center z-20 animate-in fade-in duration-200">
                      <AlertCircle
                        className="text-amber-400 mb-3 animate-bounce"
                        size={40}
                      />
                      <h3 className="font-serif font-bold text-lg mb-1">
                        {language === "he"
                          ? "גישה למצלמה נכשלה"
                          : "Camera Access Unavailable"}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-[240px] leading-relaxed mb-5">
                        {language === "he"
                          ? "לא נמצא מכשיר מצלמה או שאין הרשאת גישה. באפשרותך לבחור/להעלות תמונה מגלריה במקום זאת."
                          : "No camera device found or access was denied. You can select an image from your gallery instead."}
                      </p>

                      <div className="flex flex-col items-center gap-3">
                        <label
                          htmlFor="gallery-upload-error-fallback"
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs px-5 py-3 rounded-full active:scale-95 transition-all shadow-md animate-pulse">
                            <ImageIcon size={16} />
                            <span>
                              {language === "he"
                                ? "בחר מאכל מגלריה"
                                : "Select Photo from Gallery"}
                            </span>
                          </div>
                          <input
                            type="file"
                            id="gallery-upload-error-fallback"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>

                        <Button
                          onClick={() => {
                            setActiveInputTab("text");
                            setCameraError(null);
                          }}
                          variant="link"
                          className="text-amber-400 text-xs underline font-semibold hover:text-amber-300 transition-colors"
                        >
                          {language === "he"
                            ? "⌨️ מעבר לחיפוש מאכל לפי שם"
                            : "⌨️ Switch to Search by Name instead"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Modern native camera controls overlayed at the bottom of the viewfinder */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-6 z-10">
                    <label
                      htmlFor="gallery-upload-scan"
                      className="cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border border-white/10">
                        <ImageIcon size={20} />
                      </div>
                      <input
                        type="file"
                        id="gallery-upload-scan"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <Button
                      onClick={capture}
                      size="lg"
                      className="rounded-full w-16 h-16 shadow-2xl bg-white/90 hover:bg-white text-primary hover:text-primary transition-transform active:scale-95 border-4 border-white/35 p-0"
                      aria-label="Take photo"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center m-1">
                        <Camera size={22} className="text-primary" />
                      </div>
                    </Button>
                    <div className="w-12" />{" "}
                    {/* Symmetric spacing for centering */}
                  </div>
                </div>
              ) : (
                <Card className="w-full border-none shadow-sm dark:bg-muted/30">
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground block text-start">
                        {language === "he"
                          ? "הקלד שם מאכל לבדיקה מיידית (ללא עלות AI):"
                          : "Type a food name for an instant blessing verification:"}
                      </label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="search"
                          placeholder={
                            language === "he"
                              ? "למשל: תפוח, מים, לחם, פיצה..."
                              : "e.g. apple, water, bread, pizza..."
                          }
                          value={textQuery}
                          onChange={(e) => {
                            setTextQuery(e.target.value);
                            if (textLookupError) setTextLookupError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleTextQuerySearch();
                            }
                          }}
                          className="flex-1 h-11 px-3.5 rounded-xl bg-muted/65 border-none text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-start"
                        />
                        <Button
                          onClick={handleTextQuerySearch}
                          className="h-11 px-4 rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground min-w-[75px]"
                        >
                          {language === "he" ? "בדוק" : "Search"}
                        </Button>
                      </div>
                    </div>

                    {/* Suggest standard items for easy clicking */}
                    <div className="space-y-2 mt-2 pt-1 text-start">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                        {language === "he"
                          ? "מאכלים נפוצים ביותר (ללא עלות תווים):"
                          : "Ultra-Common Foods (Instant & Token-free):"}
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          "Water",
                          "Bread",
                          "Apple",
                          "Banana",
                          "Cookie",
                          "Pizza",
                          "Cake",
                          "Pasta",
                          "Chocolate",
                          "Coffee",
                        ].map((foodName) => (
                          <button
                            key={foodName}
                            onClick={() => {
                              const nameWithLanguage =
                                language === "he"
                                  ? foodName === "Water"
                                    ? "מים"
                                    : foodName === "Bread"
                                      ? "לחם"
                                      : foodName === "Apple"
                                        ? "תפוח"
                                        : foodName === "Banana"
                                          ? "בננה"
                                          : foodName === "Cookie"
                                            ? "עוגייה"
                                            : foodName === "Pizza"
                                              ? "פיצה"
                                              : foodName === "Cake"
                                                ? "עוגה"
                                                : foodName === "Pasta"
                                                  ? "פסטה"
                                                  : foodName === "Chocolate"
                                                    ? "שוקולד"
                                                    : foodName === "Coffee"
                                                      ? "קפה"
                                                      : foodName
                                  : foodName;
                              setTextQuery(nameWithLanguage);
                              handleSelectCommonFood(nameWithLanguage);
                            }}
                            className="text-[11px] font-medium bg-muted hover:bg-muted/95 border border-border/80 px-2.5 py-1 rounded-lg transition-colors text-foreground"
                          >
                            {language === "he" && foodName === "Water"
                              ? "מים"
                              : language === "he" && foodName === "Bread"
                                ? "לחם"
                                : language === "he" && foodName === "Apple"
                                  ? "תפוח"
                                  : language === "he" && foodName === "Banana"
                                    ? "בננה"
                                    : language === "he" && foodName === "Cookie"
                                      ? "עוגייה"
                                      : language === "he" &&
                                          foodName === "Pizza"
                                        ? "פיצה"
                                        : language === "he" &&
                                            foodName === "Cake"
                                          ? "עוגה"
                                          : language === "he" &&
                                              foodName === "Pasta"
                                            ? "פסטה"
                                            : language === "he" &&
                                                foodName === "Chocolate"
                                              ? "שוקולד"
                                              : language === "he" &&
                                                  foodName === "Coffee"
                                                ? "קפה"
                                                : foodName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="w-full border-none shadow-sm dark:bg-muted/30">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-sans">
                      {language === "he"
                        ? "הגדרות מתקדמות"
                        : "Advanced Settings"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setMealContext("none")}
                      className={`h-11 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                        mealContext === "none"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                      }`}
                    >
                      <span>{t("normal_meal")}</span>
                    </button>
                    <button
                      onClick={() => setMealContext("bread_meal")}
                      className={`h-11 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                        mealContext === "bread_meal"
                          ? "bg-primary text-primary-foreground border-primary animate-pulse"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                      }`}
                    >
                      <span>{t("already_ate_bread")}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block text-start">
                      {t("additional_notes")}
                    </label>
                    <input
                      placeholder={t("notes_placeholder")}
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-muted/60 border-none text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-start"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            (!scanResult || isScanning) && (
              <motion.div
                key="loading-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-lg ring-1 ring-border shrink-0"
              >
                <img
                  src={imageSrc}
                  alt="Scanned food"
                  className="w-full h-full object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md p-6 text-center">
                    {currentDedication ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentDedication.cycleKey || currentDedication.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5 }}
                          className="flex flex-col items-center"
                        >
                          <div className="text-4xl mb-4 animate-bounce">
                            {currentDedication.category === "לעילוי נשמת" && "🕯️"}
                            {currentDedication.category === "לרפואת" && "❤️‍🩹"}
                            {currentDedication.category === "להצלחת" && "📈"}
                            {currentDedication.category === "לזיווג הגון" && "💍"}
                            {currentDedication.category === "לזרע של קיימא" && "👶"}
                          </div>
                          <h3 className="text-xl font-bold mb-2 tracking-wide text-primary">
                            {currentDedication.category}
                          </h3>
                          <p className="text-2xl font-hebrew font-medium">
                            {currentDedication.name}
                          </p>
                          <p className="text-lg opacity-80 mt-1">
                            {currentDedication.gender === 'female' ? 'בת' : 'בן'} {currentDedication.parentName}
                          </p>
                          <div className="mt-8 flex flex-col items-center">
                            <RefreshCw className="animate-spin text-white/50 mb-2" size={20} />
                            <p className="text-xs text-white/50 font-medium tracking-wider uppercase">
                              {t("identifying")}
                            </p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <>
                        <RefreshCw
                          className="animate-spin mb-4 text-primary animate-pulse"
                          size={32}
                        />
                        <p className="font-medium text-lg tracking-wide">
                          {t("identifying")}
                        </p>
                      </>
                    )}
                  </div>
                )}
                {scanError && !isScanning && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md p-6 text-center">
                    <AlertCircle className="mb-4 text-red-500" size={32} />
                    <p className="font-semibold text-lg mb-2 text-red-400">Scan Failed</p>
                    <p className="text-sm opacity-90 mb-6">{scanError}</p>
                    <div className="flex gap-3">
                      <Button onClick={() => setScanError(null)} variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
                        {t("cancel")}
                      </Button>
                      <Button onClick={() => analyzeImage(imageSrc!)} className="bg-red-600 hover:bg-red-700 text-white">
                        <RefreshCw className="mr-2" size={16} />
                        {language === "he" ? "נסה שוב" : "Retry"}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scanResult && !isScanning && (
            <motion.div
              key="scan-result-card"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="w-full flex justify-center shrink-0"
            >
              <Card 
                className="w-full max-w-sm shadow-2xl border-none shrink-0 mb-8 flex flex-col h-full max-h-[80vh] overflow-y-auto bg-card text-card-foreground"
                dir={language === "he" ? "rtl" : "ltr"}
              >
                <CardContent className="p-0 flex flex-col h-full relative">
                  {/* Header Section */}
                  <div className="bg-primary text-primary-foreground p-4 text-center rounded-t-xl shrink-0 flex items-center justify-between">
                    <div className="text-start flex-1 min-w-0 pr-3">
                      <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-0.5">
                        {t("identified")}
                      </h2>
                      <h3 className="text-2xl font-bold truncate">
                        {scanResult.name}
                      </h3>
                      {scanResult.confidence > 0 && (
                        <p className="text-xs opacity-90">
                          {t("confidence")}:{" "}
                          {Math.round(scanResult.confidence * 100)}%
                        </p>
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 shrink-0">
                      <img
                        src={imageSrc as string}
                        className="w-full h-full object-cover"
                        alt="Scanned food"
                      />
                    </div>
                  </div>

                  {/* Multiple Blessings Alert */}
                  {scanResult.requires_multiple_blessings && (
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 flex items-start gap-2 border-b border-blue-100/30 dark:border-blue-900/30 shrink-0">
                      <Info
                        className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                        size={16}
                      />
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        {t("multiple_blessings_alert")}
                      </p>
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col bg-card overflow-y-auto text-start">
                    {/* Top AI Tag */}
                    <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/30 p-2.5 rounded-lg border border-orange-200 dark:border-orange-900/50 mb-4 shrink-0">
                      <span className="text-xs font-medium text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        {t("ai_disclaimer")}
                      </span>
                      <Link
                        to="/ask"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        {t("ask_rabbi")} <ExternalLink size={10} />
                      </Link>
                    </div>

                    {!scanResult.isExtended ? (
                      <>
                        {/* Standard Single Blessing Card */}
                        <div className="bg-muted p-4 rounded-xl text-center shadow-sm mb-4">
                          <h3
                            className="text-2xl font-hebrew font-bold mb-1 min-h-[30px] leading-tight text-foreground"
                            dir="rtl"
                          >
                            {scanResult.details?.traditions?.[tradition]
                              ?.text ||
                              scanResult.details?.hebrew_text ||
                              "שֶׁהַכֹּל נִהְיֶה בִּדְבָרוֹ"}
                          </h3>
                          <p className="text-sm italic opacity-80 text-muted-foreground">
                            {scanResult.details?.transliteration}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {scanResult.has_branches &&
                          scanResult.branches &&
                          scanResult.branches.length > 1 && (
                            <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm mb-6">
                              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[11px] font-black">
                                  ?
                                </span>
                                {language === "he" ? "סיטואציה" : "SITUATION"}
                              </h3>
                              <p className="text-sm font-medium text-foreground/90 leading-snug mb-4">
                                {scanResult.branch_question ||
                                  "How do you plan to eat this?"}
                              </p>
                              <div className="flex flex-col gap-2">
                                {scanResult.branches.map(
                                  (branch: any, idx: number) => (
                                    <button
                                      key={branch.branch_id || idx}
                                      onClick={() => setSelectedBranch(idx)}
                                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 text-start transition-all ${selectedBranch === idx ? "bg-primary/5 border-primary shadow-sm" : "bg-background border-border hover:bg-muted/50 hover:border-border/80"}`}
                                    >
                                      <div
                                        className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${selectedBranch === idx ? "border-primary bg-primary" : "border-muted-foreground/30"}`}
                                      >
                                        {selectedBranch === idx && (
                                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                        )}
                                      </div>
                                      <span className={`text-sm ${selectedBranch === idx ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                                        {branch.branch_label}
                                      </span>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {(() => {
                          const activeBranch =
                            scanResult.branches?.[selectedBranch] ||
                            scanResult.branches?.[0];

                          const parsedRishonot = parseInstructionSteps(
                            (activeBranch?.instructions_rishona && activeBranch.instructions_rishona.length > 0)
                              ? activeBranch.instructions_rishona
                              : scanResult.steps
                          );
                          const parsedAcharonot = parseInstructionSteps(
                            (activeBranch?.instructions_acharona && activeBranch.instructions_acharona.length > 0)
                              ? activeBranch.instructions_acharona
                              : scanResult.after_blessings
                          );

                          const hasRishonot = parsedRishonot.length > 0;
                          const hasAcharonot = parsedAcharonot.length > 0;

                          const legacySteps = parseInstructionSteps(scanResult.steps);

                          // Fallback to legacy steps if they exist
                          if (legacySteps.length > 0 && (!activeBranch || (!hasRishonot && !hasAcharonot)) && !scanResult.markdown_result) {
                            return (
                              <div className="text-start mt-6">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                                  {language === "he" ? "הוראות ברכה שלב לפי שלב" : "STEP-BY-STEP INSTRUCTIONS"}
                                </h3>
                                <div className="space-y-3">
                                  {legacySteps.map(
                                    (text: string, idx: number) => {
                                      return (
                                        <div
                                          key={`legacy-step-${idx}`}
                                          className="flex items-start gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/40 text-sm font-medium text-foreground/90 leading-relaxed"
                                        >
                                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-muted-foreground font-bold border border-border">
                                            {idx + 1}
                                          </div>
                                          <div>{renderTextWithLinks(text)}</div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                                {scanResult.after_blessings && scanResult.after_blessings.length > 0 && (
                                  <div className="mt-8">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                                      {language === "he" ? "ברכה אחרונה (אחרי האוכל)" : "AFTER BLESSINGS"}
                                    </h3>
                                    <div className="space-y-3">
                                      {parseInstructionSteps(scanResult.after_blessings).map((text: string, idx: number) => {
                                        return (
                                          <div
                                            key={`legacy-after-${idx}`}
                                            className="flex items-start gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/40 text-sm font-medium text-foreground/90 leading-relaxed"
                                          >
                                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-muted-foreground font-bold border border-border">
                                              {idx + 1}
                                            </div>
                                            <div>{renderTextWithLinks(text)}</div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                {scanResult.halakhic_notes && scanResult.halakhic_notes.length > 0 && (
                                  <div className="text-start mt-8">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                                      {language === "he" ? "הערות הלכתיות" : "HALAKHIC NOTES"}
                                    </h3>
                                    <div className="space-y-3">
                                      {scanResult.halakhic_notes.map((note: string, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-blue-50/50 dark:bg-blue-950/20 border border-border/40 rounded-2xl p-4 flex items-start gap-4"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Info size={16} />
                                          </div>
                                          <div className="text-sm pt-1">
                                            <p className="leading-relaxed font-medium">
                                              {renderTextWithLinks(note)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Fallback to markdown if missing structured data
                          if (!activeBranch || (!hasRishonot && !hasAcharonot)) {
                            return (
                              <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 text-start">
                                <div className="text-sm text-foreground/90 leading-relaxed font-medium prose prose-sm dark:prose-invert max-w-none">
                                  <Markdown
                                    components={{
                                      a: ({ node, ...props }) => {
                                        const href = props.href || "";
                                        if (href.startsWith("#bracha-")) {
                                          const searchId = href.replace(
                                            "#bracha-",
                                            "",
                                          );
                                          return (
                                            <Link
                                              to={`/brachot?open=${searchId}`}
                                              className="text-primary font-bold underline hover:text-primary/80 inline-flex items-center gap-0.5 mx-0.5"
                                            >
                                              {props.children}
                                            </Link>
                                          );
                                        }
                                        return (
                                          <a
                                            {...props}
                                            className="text-primary underline"
                                          />
                                        );
                                      },
                                      p: ({ node, ...props }) => (
                                        <p
                                          className="mb-4 leading-relaxed text-sm"
                                          {...props}
                                        />
                                      ),
                                      h1: ({ node, ...props }) => (
                                        <h1
                                          className="text-xl font-bold mt-6 mb-3"
                                          {...props}
                                        />
                                      ),
                                      h2: ({ node, ...props }) => (
                                        <h2
                                          className="text-lg font-bold mt-6 mb-3 text-primary"
                                          {...props}
                                        />
                                      ),
                                      h3: ({ node, ...props }) => (
                                        <h3
                                          className="text-base font-bold mt-5 mb-2 text-foreground bg-muted/40 p-2 rounded-lg border border-border"
                                          {...props}
                                        />
                                      ),
                                      ul: ({ node, ...props }) => (
                                        <ul
                                          className="list-disc pl-5 mb-4 space-y-2 text-sm"
                                          {...props}
                                        />
                                      ),
                                      ol: ({ node, ...props }) => (
                                        <ol
                                          className="list-decimal pl-5 mb-4 space-y-2 text-sm"
                                          {...props}
                                        />
                                      ),
                                      li: ({ node, ...props }) => (
                                        <li className="pl-1" {...props} />
                                      ),
                                      strong: ({ node, ...props }) => (
                                        <strong
                                          className="font-bold text-foreground"
                                          {...props}
                                        />
                                      ),
                                      hr: ({ node, ...props }) => (
                                        <hr
                                          className="my-6 border-dashed border-border"
                                          {...props}
                                        />
                                      ),
                                    }}
                                  >
                                    {scanResult.markdown_result ||
                                      "*No instructions provided.*"}
                                  </Markdown>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <>
                              {hasRishonot && (
                                <div className="text-start mt-6">
                                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    {language === "he" ? "הוראות ברכה שלב לפי שלב" : "STEP-BY-STEP INSTRUCTIONS"}
                                  </h3>
                                  <div className="space-y-3">
                                    {parsedRishonot.map(
                                      (instructionStr: string, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex items-start gap-4 relative overflow-hidden"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                                            {idx + 1}
                                          </div>
                                          <div className="text-sm pt-1">
                                            <p className="leading-relaxed font-medium">
                                              {renderTextWithLinks(
                                                instructionStr,
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {hasAcharonot && (
                                <div className="text-start mt-8">
                                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    {language === "he" ? "ברכה אחרונה (לאחר האכילה)" : "AFTER MEAL BLESSING"}
                                  </h3>
                                  <div className="space-y-3">
                                    {parsedAcharonot.map(
                                      (instructionStr: string, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-green-50/50 dark:bg-green-950/20 border border-border/40 rounded-2xl p-4 flex items-start gap-4"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Flag size={16} />
                                          </div>
                                          <div className="text-sm pt-1">
                                            <p className="leading-relaxed font-medium">
                                              {renderTextWithLinks(
                                                instructionStr,
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {scanResult.halakhic_notes && scanResult.halakhic_notes.length > 0 && (
                                <div className="text-start mt-8">
                                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    {language === "he" ? "הערות הלכתיות" : "HALAKHIC NOTES"}
                                  </h3>
                                  <div className="space-y-3">
                                    {scanResult.halakhic_notes.map((note: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="bg-blue-50/50 dark:bg-blue-950/20 border border-border/40 rounded-2xl p-4 flex items-start gap-4"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <Info size={16} />
                                        </div>
                                        <div className="text-sm pt-1">
                                          <p className="leading-relaxed font-medium">
                                            {renderTextWithLinks(note)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* AI Tag */}
                    <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/30 p-2.5 rounded-lg border border-orange-200 dark:border-orange-900/50 mb-4">
                      <span className="text-xs font-medium text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        {t("ai_disclaimer")}
                      </span>
                      <Link
                        to="/ask"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        {t("ask_rabbi")} <ExternalLink size={10} />
                      </Link>
                    </div>

                    {/* Legacy Instructions (only for unextended) */}
                    {!scanResult.isExtended && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t("how_to_eat")}
                        </h4>
                        <div className="bg-muted/30 border border-border/50 p-3.5 rounded-xl">
                          <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                            {renderTextWithLinks(
                              language === "he"
                                ? scanResult.how_to_eat_instructions_he ||
                                    scanResult.details?.instructions?.he
                                : scanResult.how_to_eat_instructions_en ||
                                    scanResult.details?.instructions?.en ||
                                    "1. Say blessing. 2. Eat food.",
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Feedback Section */}
                    <div className="pt-2 mt-auto">
                      <h4 className="text-xs font-semibold text-center mb-2 text-muted-foreground">
                        {t("was_this_helpful")}
                      </h4>
                      {hasGivenFeedbackForThisScan ? (
                        <div className="bg-success/5 border border-success/20 p-3 rounded-xl text-center">
                          <p className="text-xs text-success font-semibold flex items-center justify-center gap-1.5 font-sans">
                            <Check size={14} /> {t("feedback_submitted")}
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-10 border-success/30 hover:bg-success/10 hover:text-success"
                            onClick={() => handleFeedback("up")}
                          >
                            <ThumbsUp size={16} className="mr-2" /> {t("yes")}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-10 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setFeedbackType("down");
                              setShowFeedbackModal(true);
                            }}
                          >
                            <ThumbsDown size={16} className="mr-2" /> {t("no")}
                          </Button>
                        </div>
                      )}
                      {feedbackSuccess && !hasGivenFeedbackForThisScan && (
                        <p className="text-xs text-center text-success mt-2 font-medium">
                          {t("feedback_thanks")}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={retake}
                      variant="secondary"
                      className="w-full rounded-xl py-5 font-semibold mt-4"
                    >
                      {t("scan_another")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                {t("feedback_modal_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("feedback_modal_subtitle")}
              </p>
              <textarea
                className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("feedback_placeholder")}
                value={feedbackText}
                maxLength={300}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex gap-3 justify-end items-center">
                <span className="text-xs text-muted-foreground flex-1">
                  {feedbackText.length}/300
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={submitFeedbackText}
                  disabled={!feedbackText.trim()}
                >
                  {t("submit_btn")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
