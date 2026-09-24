export interface GroundingFood {
  nameEn: string;
  nameHe: string;
  keys: string[];
  primaryBracha: "haetz" | "haadama" | "mezonot" | "shehakol" | "hamotzi" | "hagefen" | "noblessing" | string;
  afterBlessings: string[];
  notes?: string;
  steps?: {
    is_conditional: boolean;
    condition_question?: string;
    text?: string;
    paths?: {
      label: string;
      text: string;
      after_blessings?: string[];
    }[];
  }[];
}

export const GROUNDING_FOODS_DB: GroundingFood[] = [
  {
    nameEn: "Avocado",
    nameHe: "אבוקדו",
    keys: ["avocado", "אבוקדו", "avocados"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Watermelon",
    nameHe: "אבטיח",
    keys: ["watermelon", "אבטיח", "watermelons"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Nuts",
    nameHe: "אגוזים",
    keys: ["nuts", "אגוזים", "nut", "walnuts", "pecans", "walnut", "pecan"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    notes: "Most types are Ha'etz, except peanuts which are Ha'adama.",
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat. Note: Most types are Ha'etz, except peanuts which are Ha'adama." }]
  },
  {
    nameEn: "Pear",
    nameHe: "אגס",
    keys: ["pear", "אגס", "pears"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Blueberries",
    nameHe: "אוכמניות",
    keys: ["blueberries", "אוכמניות", "blueberry", "blue berries"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Rice",
    nameHe: "אורז",
    keys: ["rice", "אורז", "white rice", "brown rice"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    notes: "Rice is Mezonot but gets Borei Nefashot afterward.",
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Noodles",
    nameHe: "אטריות",
    keys: ["noodles", "אטריות", "noodle", "pasta", "פסטה", "spaghetti", "ספגטי", "macaroni"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Pineapple",
    nameHe: "אננס",
    keys: ["pineapple", "אננס", "pineapples"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Peas",
    nameHe: "אפונה",
    keys: ["peas", "אפונה", "pea"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Persimmon",
    nameHe: "אפרסמון",
    keys: ["persimmon", "אפרסמון", "persimmons"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Peach",
    nameHe: "אפרסק",
    keys: ["peach", "אפרסק", "peaches"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Nectarine",
    nameHe: "נקטרינה",
    keys: ["nectarine", "נקטרינה", "nectarines"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Grapefruit",
    nameHe: "אשכולית",
    keys: ["grapefruit", "אשכולית", "grapefruits"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Baguette",
    nameHe: "באגט",
    keys: ["baguette", "באגט", "baguettes"],
    primaryBracha: "hamotzi",
    afterBlessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."],
    steps: [{ is_conditional: false, text: "Wash hands (Netilat Yadayim) with a blessing, recite [HaMotzi](#bracha-hamotzi) and eat." }]
  },
  {
    nameEn: "Peanuts",
    nameHe: "בוטנים",
    keys: ["peanuts", "בוטנים", "peanut"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Bourekas",
    nameHe: "בורקס",
    keys: ["bourekas", "בורקס", "burekas", "boureka"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Pretzels",
    nameHe: "בייגלה",
    keys: ["pretzels", "בייגלה", "pretzel", "beigele"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Bagel",
    nameHe: "בייגל",
    keys: ["bagel", "בייגל", "bagels"],
    primaryBracha: "hamotzi",
    afterBlessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."],
    steps: [{ is_conditional: false, text: "Wash hands (Netilat Yadayim) with a blessing, recite [HaMotzi](#bracha-hamotzi) and eat." }]
  },
  {
    nameEn: "Bissli",
    nameHe: "ביסלי",
    keys: ["bissli", "ביסלי", "bisli"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Biscuit",
    nameHe: "ביסקוויט",
    keys: ["biscuit", "ביסקוויט", "biscuits", "cookies", "cookie"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Egg",
    nameHe: "ביצה",
    keys: ["egg", "ביצה", "eggs", "boiled egg", "fried egg"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Beer",
    nameHe: "בירה",
    keys: ["beer", "בירה", "beers"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you drank a Revi'it (~86ml) in a quick gulp."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Bamba",
    nameHe: "במבה",
    keys: ["bamba", "במבה"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Banana",
    nameHe: "בננה",
    keys: ["banana", "בננה", "bananas"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Baklava",
    nameHe: "בקלאווה",
    keys: ["baklava", "בקלאווה", "baklawa"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Meat",
    nameHe: "בשר",
    keys: ["meat", "בשר", "steak", "beef", "chicken", "עוף", "סטייק"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Cheese",
    nameHe: "גבינה",
    keys: ["cheese", "גבינה", "cheeses", "cottage cheese"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Guava",
    nameHe: "גויאבה",
    keys: ["guava", "גויאבה", "guavas"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Carrot",
    nameHe: "גזר",
    keys: ["carrot", "גזר", "carrots"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Wafer rolls",
    nameHe: "גליליות",
    keys: ["wafer rolls", "גליליות", "wafer roll"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Click (Chocolate snack)",
    nameHe: "קליק",
    keys: ["click", "קליק", "chocolate snack", "clicks"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Red Bell Pepper",
    nameHe: "פלפל אדום",
    keys: ["red bell pepper", "פלפל אדום", "pepper", "פלפל", "bell pepper"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Seeds / Nuts (Pitzuchim)",
    nameHe: "פיצוחים",
    keys: ["seeds", "nuts", "pitzuchim", "פיצוחים", "גרעינים", "sunflower seeds"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Honey",
    nameHe: "דבש",
    keys: ["honey", "דבש"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Fish",
    nameHe: "דג",
    keys: ["fish", "דג", "salmon", "סלמון", "tuna", "טונה"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Cherry",
    nameHe: "דובדבן",
    keys: ["cherry", "דובדבן", "cherries", "דובדבנים"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Pumpkin",
    nameHe: "דלעת",
    keys: ["pumpkin", "דלעת", "pumpkins"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Wafers",
    nameHe: "וופלים",
    keys: ["wafers", "וופלים", "wafer", "וופל", "bavarian wafers"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Vitamins",
    nameHe: "ויטמינים",
    keys: ["vitamins", "ויטמינים", "vitamin", "gummy vitamins"],
    primaryBracha: "noblessing",
    afterBlessings: [],
    notes: "Unless they taste good, then Shehakol.",
    steps: [
      {
        is_conditional: true,
        condition_question: "Do they have a good taste (gummy, flavored)?",
        paths: [
          {
            label: "Yes, they taste good",
            text: "Recite [Shehakol](#bracha-shehakol) and consume.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) if consumed Kezayit (~28g)."]
          },
          {
            label: "No, swallowed like pill / medicinal",
            text: "No blessing is recited.",
            after_blessings: []
          }
        ]
      }
    ]
  },
  {
    nameEn: "Olive",
    nameHe: "זית",
    keys: ["olive", "זית", "olives", "זיתים"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Al Ha'etz](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g) since olives are one of the Seven Species."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Quince",
    nameHe: "חבוש",
    keys: ["quince", "חבוש", "quinces"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Milk",
    nameHe: "חלב",
    keys: ["milk", "חלב", "glass of milk"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you drank a Revi'it (~86ml) in a quick gulp."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Regular Challah",
    nameHe: "חלה רגילה",
    keys: ["regular challah", "חלה רגילה", "challah", "חלה"],
    primaryBracha: "hamotzi",
    afterBlessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."],
    steps: [{ is_conditional: false, text: "Wash hands (Netilat Yadayim) with a blessing, recite [HaMotzi](#bracha-hamotzi) and eat." }]
  },
  {
    nameEn: "Sweet Challah",
    nameHe: "חלה מתוקה",
    keys: ["sweet challah", "חלה מתוקה"],
    primaryBracha: "mezonot",
    afterBlessings: [],
    steps: [
      {
        is_conditional: true,
        condition_question: "Which custom do you follow?",
        paths: [
          {
            label: "Sephardic Custom",
            text: "Recite [Mezonot](#bracha-mezonot) and eat.",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward unless establishing a full meal."]
          },
          {
            label: "Ashkenazic Custom",
            text: "Recite [HaMotzi](#bracha-hamotzi) and eat (requires Netilat Yadayim).",
            after_blessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Halva (Sesame)",
    nameHe: "חלבה",
    keys: ["halva", "חלבה", "halvah"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Butter",
    nameHe: "חמאה",
    keys: ["butter", "חמאה"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Lettuce",
    nameHe: "חסה",
    keys: ["lettuce", "חסה"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Eggplant",
    nameHe: "חצילים",
    keys: ["eggplant", "חצילים", "חציל", "aubergine"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Carob",
    nameHe: "חרוב",
    keys: ["carob", "חרוב", "carobs"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Tofu",
    nameHe: "טופו",
    keys: ["tofu", "טופו"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Tahini",
    nameHe: "טחינה",
    keys: ["tahini", "טחינה", "tahina"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Yogurt",
    nameHe: "יוגורט",
    keys: ["yogurt", "יוגורט", "cottage", "קוטג'", "sour cream", "שמנת חמוצה"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Wine",
    nameHe: "יין",
    keys: ["wine", "יין", "red wine", "white wine"],
    primaryBracha: "hagefen",
    afterBlessings: ["Recite [Al HaGefen](#bracha-al-hamichya) afterward if you drank a Revi'it (~86ml) in a quick swallow."],
    steps: [{ is_conditional: false, text: "Say [Borei Pri Hagafen](#bracha-hagefen) and drink." }]
  },
  {
    nameEn: "Liver",
    nameHe: "כבד",
    keys: ["liver", "כבד", "chopped liver"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Cabbage",
    nameHe: "כרוב",
    keys: ["cabbage", "כרוב", "cabbages"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Vegetable Patties (Latkes)",
    nameHe: "קציצות ירקות",
    keys: ["vegetable patties", "patties", "latkes", "לביבות ירקות", "קציצות ירקות", "vegetable patty", "latke"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Life (Sour Milk)",
    nameHe: "לבן",
    keys: ["life", "sour milk", "לבן", "leben", "kefir"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Bread",
    nameHe: "לחם",
    keys: ["bread", "לחם", "white bread", "rye bread", "sourdough"],
    primaryBracha: "hamotzi",
    afterBlessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."],
    steps: [{ is_conditional: false, text: "Wash hands (Netilat Yadayim) with a blessing, recite [HaMotzi](#bracha-hamotzi) and eat." }]
  },
  {
    nameEn: "Lemonade",
    nameHe: "לימונדה",
    keys: ["lemonade", "לימונדה"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you drank a Revi'it (~86ml) in a quick gulp."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Water",
    nameHe: "מים",
    keys: ["water", "מים", "pure water", "bottled water"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward (if thirsty and drank 86ml)."],
    notes: "If thirsty - Shehakol and then Borei Nefashot. If not thirsty (eg, for medicine) - no blessing.",
    steps: [
      {
        is_conditional: true,
        condition_question: "Are you drinking water because you are thirsty?",
        paths: [
          {
            label: "Yes, I am thirsty",
            text: "Recite [Shehakol](#bracha-shehakol) and drink.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) if drank Revi'it (~86ml) quickly."]
          },
          {
            label: "No, drinking for health/tablet",
            text: "No blessing is recited.",
            after_blessings: []
          }
        ]
      }
    ]
  },
  {
    nameEn: "Juice (Fruit or Vegetable)",
    nameHe: "מיץ פירות או ירקות",
    keys: ["juice", "מיץ", "orange juice", "apple juice", "fruit juice", "vegetable juice"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you drank a Revi'it (~86ml) in a quick gulp."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Grape Juice",
    nameHe: "מיץ ענבים",
    keys: ["grape juice", "מיץ ענבים"],
    primaryBracha: "hagefen",
    afterBlessings: ["Recite [Al HaGefen](#bracha-al-hamichya) afterward if you drank a Revi'it (~86ml) in a quick swallow."],
    steps: [{ is_conditional: false, text: "Say [Borei Pri Hagafen](#bracha-hagefen) and drink." }]
  },
  {
    nameEn: "Apricot",
    nameHe: "משמש",
    keys: ["apricot", "משמש", "apricots"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Malawi",
    nameHe: "מלאווח",
    keys: ["malawi", "מלאווח", "malawach", "melafech"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Mango",
    nameHe: "מנגו",
    keys: ["mango", "מנגו", "mangoes"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Mandarin",
    nameHe: "מנדרינה",
    keys: ["mandarin", "מנדרינה", "mandarins"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Chewing Gum",
    nameHe: "מסטיק",
    keys: ["chewing gum", "מסטיק", "gum"],
    primaryBracha: "shehakol",
    afterBlessings: [],
    notes: "Requires Shehakol. No last blessing.",
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and chew. No after-blessing is said because the core volume is not swallowed." }]
  },
  {
    nameEn: "Matzah",
    nameHe: "מצה",
    keys: ["matzah", "מצה", "matzo", "matzot"],
    primaryBracha: "hamotzi",
    afterBlessings: [],
    steps: [
      {
        is_conditional: true,
        condition_question: "Which custom and season apply?",
        paths: [
          {
            label: "Ashkenazic Custom / Passover season",
            text: "Recite [HaMotzi](#bracha-hamotzi) and eat (requires Netilat Yadayim).",
            after_blessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."]
          },
          {
            label: "Sephardic Custom (Outside Passover)",
            text: "Recite [Mezonot](#bracha-mezonot) and eat.",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Vegetable Soup",
    nameHe: "מרק ירקות",
    keys: ["vegetable soup", "מרק ירקות"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."],
    notes: "If vegetables are noticeable - Ha'adama. If not noticeable - Shehakol.",
    steps: [
      {
        is_conditional: true,
        condition_question: "Are the vegetables noticeable and distinct in the bowl?",
        paths: [
          {
            label: "Yes, there are distinct vegetables",
            text: "Recite [HaAdama](#bracha-haadama) and eat.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          },
          {
            label: "No, purely broth / pureed completely",
            text: "Recite [Shehakol](#bracha-shehakol) and consume.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Chicken Soup",
    nameHe: "מרק עוף",
    keys: ["chicken soup", "מרק עוף", "meat broth"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g / Revi'it)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Marshmallow",
    nameHe: "מרשמלו",
    keys: ["marshmallow", "מרשמלו", "marshmallows"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Sausage / Hot dog",
    nameHe: "נקניקייה",
    keys: ["sausage", "נקניקייה", "hot dog", "נקניק", "sausages", "hot dogs"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Sabra (Prickly Pear)",
    nameHe: "סברס",
    keys: ["sabra", "סברס", "prickly pear", "sabras"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Sugar",
    nameHe: "סוכר",
    keys: ["sugar", "סוכר", "sugar crystals"],
    primaryBracha: "shehakol",
    afterBlessings: [],
    steps: [{ is_conditional: false, text: "If consumed by itself, say [Shehakol](#bracha-shehakol). No after-blessing." }]
  },
  {
    nameEn: "Doughnuts (Sufganiyot)",
    nameHe: "סופגניות",
    keys: ["doughnuts", "סופגניות", "doughnut", "sufganiyot", "sufganiyah", "donut"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Beetroot (Cooked)",
    nameHe: "סלק מבושל",
    keys: ["beetroot", "סלק מבושל", "cooked beetroot", "beet", "beets", "סלק"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Celery",
    nameHe: "סלרי",
    keys: ["celery", "סלרי"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Sambusak",
    nameHe: "סמבוסק",
    keys: ["sambusak", "סמבוסק"],
    primaryBracha: "mezonot",
    afterBlessings: [],
    notes: "Deep-fried: Mezonot and Al Hamichya. Baked in an oven: Hamotzi and Birkat Hamazon.",
    steps: [
      {
        is_conditional: true,
        condition_question: "How is the Sambusak prepared?",
        paths: [
          {
            label: "Deep-Fried",
            text: "Recite [Mezonot](#bracha-mezonot) and eat.",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward."]
          },
          {
            label: "Baked in an oven",
            text: "Recite [HaMotzi](#bracha-hamotzi) and eat (requires Netilat Yadayim).",
            after_blessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Tomato",
    nameHe: "עגבנייה",
    keys: ["tomato", "עגבנייה", "עגבניה", "tomatoes"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    notes: "Puree - Shehakol.",
    steps: [
      {
        is_conditional: true,
        condition_question: "In what form is the tomato eaten?",
        paths: [
          {
            label: "Whole / sliced / chopped",
            text: "Recite [HaAdama](#bracha-haadama) and eat.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          },
          {
            label: "Liquid Puree / Tomato paste fully liquid",
            text: "Recite [Shehakol](#bracha-shehakol) and consume.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Chicken",
    nameHe: "עוף",
    keys: ["chicken", "עוף", "cooked chicken"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Grapes",
    nameHe: "ענבים",
    keys: ["grapes", "ענבים", "grape", "green grapes", "red grapes"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Al Ha'etz](#bracha-al-hamichya) afterward since grapes are of the Seven Species."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Chestnut",
    nameHe: "ערמונים",
    keys: ["chestnut", "ערמונים", "chestnuts"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Falafel (Balls)",
    nameHe: "פלאפל",
    keys: ["falafel", "פלאפל", "falafel balls", "falafel ball"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat. Note: If in pita, the pita's HaMotzi covers the falafel." }]
  },
  {
    nameEn: "Papaya",
    nameHe: "פפאיה",
    keys: ["papaya", "פפאיה", "papayas"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Pudding",
    nameHe: "פודינג",
    keys: ["pudding", "פודינג", "custard"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Pomelo - Sweetie",
    nameHe: "פומלה",
    keys: ["pomelo", "פומלה", "sweetie", "סוויטי", "פומלית"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Popcorn",
    nameHe: "פופקורן",
    keys: ["popcorn", "פופקורן"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Pistachio",
    nameHe: "פיסטוק",
    keys: ["pistachio", "פיסטוק", "pistachios"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Pizza",
    nameHe: "פיצה",
    keys: ["pizza", "פיצה", "pizza slice"],
    primaryBracha: "mezonot",
    afterBlessings: [],
    notes: "If dough only flour and water - Hamotzi. If kneaded with fruit juice - Mezonot.",
    steps: [
      {
        is_conditional: true,
        condition_question: "How is the pizza dough kneaded, and what volume are you eating?",
        paths: [
          {
            label: "Snacking on 1 standard slice",
            text: "Recite [Mezonot](#bracha-mezonot) and eat the slice.",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward."]
          },
          {
            label: "Eating 2 or more slices (Meal volume) OR dough is purely flour/water",
            text: "Washing hands with blessing (Netilat Yadayim) is required. Recite [HaMotzi](#bracha-hamotzi) instead.",
            after_blessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Pita",
    nameHe: "פיתה",
    keys: ["pita", "פיתה", "pitas"],
    primaryBracha: "hamotzi",
    afterBlessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."],
    steps: [{ is_conditional: false, text: "Wash hands (Netilat Yadayim), recite [HaMotzi](#bracha-hamotzi) and eat." }]
  },
  {
    nameEn: "Pepper",
    nameHe: "פלפל",
    keys: ["pepper", "פלפל", "green pepper", "yellow pepper"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Rice Krispies",
    nameHe: "רייס קריספיז",
    keys: ["rice krispies", "רייס קריספיז", "puffed rice"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Rice Cakes",
    nameHe: "פריכיות אורז",
    keys: ["rice cakes", "פריכיות אורז", "rice cake", "puffed rice cakes"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    notes: "Ha'adama / Mezonot. Usually Ha'adama.",
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) (or Mezonot for some brands) and eat." }]
  },
  {
    nameEn: "Ptitim (Israeli Couscous)",
    nameHe: "פתיתים",
    keys: ["ptitim", "פתיתים", "israeli couscous", "couscous"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Raisins",
    nameHe: "צימוקים",
    keys: ["raisins", "צימוקים", "raisin", "צימוק"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Al Ha'etz](#bracha-al-hamichya) afterward since raisins are grapes (Seven Species)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Chips (French Fries)",
    nameHe: "צ'יפס",
    keys: ["chips", "french fries", "צ'יפס", "fries"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Radish",
    nameHe: "צנון",
    keys: ["radish", "צנון"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Small Radish",
    nameHe: "צנונית",
    keys: ["small radish", "צנונית", "radishes"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Croutons / Toast",
    nameHe: "קרוטונים",
    keys: ["croutons", "קרוטונים", "toast", "טוסט"],
    primaryBracha: "hamotzi",
    afterBlessings: ["Recite [Birkat Hamazon](#bracha-birkat-hamazon) afterward."],
    steps: [{ is_conditional: false, text: "Washing hands (Netilat Yadayim) is required. Recite [HaMotzi](#bracha-hamotzi) and eat." }]
  },
  {
    nameEn: "Cocoa (Drink)",
    nameHe: "שוקו",
    keys: ["cocoa", "drink", "שוקו", "hot chocolate", "chocolate drink"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you drank a Revi'it (~86ml) in a quick gulp."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Kubbeh",
    nameHe: "קובה",
    keys: ["kubbeh", "קובה", "kubeh"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Kuban",
    nameHe: "קובנה",
    keys: ["kuban", "קובנה", "kubaneh"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward."],
    notes: "Even if eaten as a full meal.",
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Noodle Kugel",
    nameHe: "קוגל אטריות",
    keys: ["noodle kugel", "קוגל אטריות", "kugel", "קוגל", "jerusalem kugel"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Potato Kugel",
    nameHe: "קוגל תפוחי אדמה",
    keys: ["potato kugel", "קוגל תפוחי אדמה", "potato kugel slice"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."],
    notes: "If potatoes are noticeable - Ha'adama. If not - Shehakol.",
    steps: [
      {
        is_conditional: true,
        condition_question: "Are individual potatoes noticeable in the kugel?",
        paths: [
          {
            label: "Yes, shredded/individual potatoes are distinct",
            text: "Recite [HaAdama](#bracha-haadama) and eat.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          },
          {
            label: "No, fully blended/processed smooth",
            text: "Recite [Shehakol](#bracha-shehakol) and eat.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Kohlrabi",
    nameHe: "קולרבי",
    keys: ["kohlrabi", "קולרבי"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Coconut",
    nameHe: "קוקוס",
    keys: ["coconut", "קוקוס", "coconuts"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Fruit Cocktail",
    nameHe: "קוקטייל פירות",
    keys: ["fruit cocktail", "קוקטייל פירות", "fruit cup"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."],
    notes: "If the majority is tree fruit - Ha'etz. If the majority is earth fruit - Ha'adama.",
    steps: [
      {
        is_conditional: true,
        condition_question: "What comprises the majority of the food selection?",
        paths: [
          {
            label: "Tree Fruits (e.g. peach, pear, apple) is the majority",
            text: "Recite [HaEtz](#bracha-haetz) and eat.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          },
          {
            label: "Earth Fruits (e.g. pineapple, strawberry, melon) is the majority",
            text: "Recite [HaAdama](#bracha-haadama) and eat.",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Cornflakes",
    nameHe: "קורנפלקס",
    keys: ["cornflakes", "קורנפלקס", "corn flakes", "breakfast cereal"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat. Note: Although corn is HaAdama, cornflakes have been processed into flours/shapes that lose that status." }]
  },
  {
    nameEn: "Ketchup",
    nameHe: "קטשופ",
    keys: ["ketchup", "קטשופ"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    notes: "If eaten separately.",
    steps: [{ is_conditional: false, text: "If consumed separately, recite [Shehakol](#bracha-shehakol). If eaten as condiment, it is covered by the primary entity." }]
  },
  {
    nameEn: "Kiwi",
    nameHe: "קיווי",
    keys: ["kiwi", "קיווי", "kiwis"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Cinnamon",
    nameHe: "קינמון",
    keys: ["cinnamon", "קינמון", "cinnamon stick"],
    primaryBracha: "noblessing",
    afterBlessings: [],
    notes: "Alone - No blessing. With sugar - Shehakol. On sucking a cinnamon stick - Shehakol.",
    steps: [
      {
        is_conditional: true,
        condition_question: "In what format are you consuming the cinnamon?",
        paths: [
          {
            label: "Sucking or chewing a cinnamon stick / with sugar",
            text: "Recite [Shehakol](#bracha-shehakol).",
            after_blessings: []
          },
          {
            label: "Consumed entirely alone as powder",
            text: "No blessing is recited.",
            after_blessings: []
          }
        ]
      }
    ]
  },
  {
    nameEn: "Zucchini",
    nameHe: "קישוא",
    keys: ["zucchini", "קישוא", "courgette", "zucchinis"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Candied Citrus Peel",
    nameHe: "קליפות הדרים מסוכרות",
    keys: ["candied citrus peel", "citrus peel", "קליפות הדרים מסוכרות"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    notes: "In sugar or chocolate.",
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Fruit Peel",
    nameHe: "קליפת פרי",
    keys: ["fruit peel", "קליפת פרי", "peel"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Clementine",
    nameHe: "קלמנטינה",
    keys: ["clementine", "קלמנטינה", "clementines"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Kneidlach (Matzah Balls)",
    nameHe: "קניידלך",
    keys: ["kneidlach", "קניידלך", "matzah balls", "matzo ball", "matzo balls"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Coffee (Drink)",
    nameHe: "קפה משקה",
    keys: ["coffee drink", "קפה משקה", "coffee", "קפה", "iced coffee"],
    primaryBracha: "shehakol",
    afterBlessings: ["Normally, coffee does not require an after-blessing as it fits standard hot beverage sipping guidelines. If cold and consumed quickly, recite [Borei Nefashot](#bracha-borei-nefashot)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Whipped Cream",
    nameHe: "קצפת",
    keys: ["whipped cream", "קצפת", "cream"],
    primaryBracha: "shehakol",
    afterBlessings: [],
    notes: "Separately - Shehakol. With cake - Mezonot (subordinate to the cake).",
    steps: [
      {
        is_conditional: true,
        condition_question: "Are you eating the whipped cream separately, or as part of a cake?",
        paths: [
          {
            label: "Munching separately on cream",
            text: "Recite [Shehakol](#bracha-shehakol).",
            after_blessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward."]
          },
          {
            label: "Eaten together with cake",
            text: "The whipped cream is subordinate. Recite [Mezonot](#bracha-mezonot) on the cake to cover both.",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Popsicle (Ice lolly)",
    nameHe: "קרטיב",
    keys: ["popsicle", "קרטיב", "ice lolly", "ice pop", "ארטיק"],
    primaryBracha: "shehakol",
    afterBlessings: [],
    notes: "No last blessing.",
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol). No after-blessing is required because it is melted slowly and not consumed as a standard drink volume." }]
  },
  {
    nameEn: "Krembo",
    nameHe: "קרמבו",
    keys: ["krembo", "קרמבו"],
    primaryBracha: "mezonot",
    afterBlessings: [],
    notes: "On the biscuit - Mezonot, on the cream - Shehakol. Some Sephardic poskim rule that Shehakol exempts the biscuit.",
    steps: [
      {
        is_conditional: true,
        condition_question: "How do you intend to eat the Krembo components?",
        paths: [
          {
            label: "Eating everything together",
            text: "Recite [Mezonot](#bracha-mezonot) and eat. The biscuit is the foundation so it covers the cream. (Some Sephardic poskim rule that Shehakol covers both).",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consume the biscuit volume (~28g)."]
          },
          {
            label: "Eating separately (cream first, then biscuit)",
            text: "Recite [Shehakol](#bracha-shehakol) on the cream. When eating the biscuit, recite [Mezonot](#bracha-mezonot).",
            after_blessings: ["Recite [Al HaMichya](#bracha-al-hamichya) for the biscuit key and [Borei Nefashot](#bracha-borei-nefashot) for the cream if volume limits met."]
          }
        ]
      }
    ]
  },
  {
    nameEn: "Cracker",
    nameHe: "קרקר",
    keys: ["cracker", "קרקר", "crackers"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Cashew",
    nameHe: "קשיו",
    keys: ["cashew", "קשיו", "cashews"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Jam",
    nameHe: "ריבה",
    keys: ["jam", "ריבה", "jelly"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat. Processed pureed fruit preserves lose their tree fruit status and become Shehakol." }]
  },
  {
    nameEn: "Pomegranate",
    nameHe: "רימון",
    keys: ["pomegranate", "רימון", "pomegranates"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Al Ha'etz](#bracha-al-hamichya) afterward since pomegranates are one of the Seven Species (Kezayit consumed)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Garlic (Raw, Cooked)",
    nameHe: "שום",
    keys: ["garlic", "שום"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Fennel",
    nameHe: "שומר",
    keys: ["fennel", "שומר"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Chocolate",
    nameHe: "שוקולד",
    keys: ["chocolate", "שוקולד", "dark chocolate", "milk chocolate"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Plum",
    nameHe: "שזיף",
    keys: ["plum", "שזיף", "plums"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Strudel",
    nameHe: "שטרודל",
    keys: ["strudel", "שטרודל", "apple strudel"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Sour Cream",
    nameHe: "שמנת חמוצה",
    keys: ["sour cream", "שמנת חמוצה", "sourcream"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Schnitzel",
    nameHe: "שניצל",
    keys: ["schnitzel", "שניצל", "chicken schnitzel"],
    primaryBracha: "shehakol",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and eat." }]
  },
  {
    nameEn: "Almonds",
    nameHe: "שקדים",
    keys: ["almonds", "שקדים", "almond", "שקד"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Almond Soup (Shkedei Marak)",
    nameHe: "שקדי מרק",
    keys: ["almond soup", "shkedei marak", "שקדי מרק"],
    primaryBracha: "mezonot",
    afterBlessings: ["Recite [Al HaMichya](#bracha-al-hamichya) afterward."],
    notes: "Even if eaten as a full meal.",
    steps: [{ is_conditional: false, text: "Say [Mezonot](#bracha-mezonot) and eat." }]
  },
  {
    nameEn: "Fig",
    nameHe: "תאנה",
    keys: ["fig", "תאנה", "figs", "תאנים"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Al Ha'etz](#bracha-al-hamichya) afterward since figs are of the Seven Species (Kezayit consumed)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Tea",
    nameHe: "תה",
    keys: ["tea", "תה", "cup of tea"],
    primaryBracha: "shehakol",
    afterBlessings: ["Normally, tea doesn't require an after-blessing because it is sipped slowly. If consumed cold and quickly, say [Borei Nefashot](#bracha-borei-nefashot)."],
    steps: [{ is_conditional: false, text: "Say [Shehakol](#bracha-shehakol) and drink." }]
  },
  {
    nameEn: "Strawberry",
    nameHe: "תות שדה",
    keys: ["strawberry", "תות שדה", "strawberries", "توت", "תות", "תותים"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Corn",
    nameHe: "תירס",
    keys: ["corn", "תירס", "sweetcorn", "corn on the cob"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Date",
    nameHe: "תמר",
    keys: ["date", "תמר", "dates", "תמרים"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Al Ha'etz](#bracha-al-hamichya) afterward since dates are are of the Seven Species (Kezayit consumed)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Orange",
    nameHe: "תפוז",
    keys: ["orange", "תפוז", "oranges"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Apple",
    nameHe: "תפוח",
    keys: ["apple", "תפוח", "apples", "red apple", "green apple"],
    primaryBracha: "haetz",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaEtz](#bracha-haetz) and eat." }]
  },
  {
    nameEn: "Potato",
    nameHe: "תפוח אדמה",
    keys: ["potato", "תפוח אדמה", "potatoes"],
    primaryBracha: "haadama",
    afterBlessings: ["Recite [Borei Nefashot](#bracha-borei-nefashot) afterward if you consumed a Kezayit (~28g)."],
    steps: [{ is_conditional: false, text: "Say [HaAdama](#bracha-haadama) and eat." }]
  },
  {
    nameEn: "Medicine",
    nameHe: "תרופה",
    keys: ["medicine", "תרופה", "pill", "pills", "cough syrup"],
    primaryBracha: "noblessing",
    afterBlessings: [],
    notes: "Without taste - No blessing, with good taste - Shehakol.",
    steps: [
      {
        is_conditional: true,
        condition_question: "Does the medicine have a good taste (e.g. flavored syrup or chewable tablet)?",
        paths: [
          {
            label: "Yes, it has a good taste",
            text: "Recite [Shehakol](#bracha-shehakol) and consume.",
            after_blessings: []
          },
          {
            label: "No, swallowed whole/tasteless",
            text: "No blessing is recited.",
            after_blessings: []
          }
        ]
      }
    ]
  }
];
