import { GROUNDING_FOODS_DB, GroundingFood } from "../data/groundingFoods";

/**
 * Normalizes text by converting to lowercase, removing double spaces, and stripping basic punctuation.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .replace(/\s{2,}/g, " ");
}

/**
 * Perform basic fuzzy matching of a query against our Ground Truth database.
 * Matches singulars, plurals, adjectives, and basic Hebrew prefixes/suffixes.
 */
export function findGroundingMatch(queryText: string): GroundingFood | null {
  if (!queryText) return null;
  
  const normQuery = normalizeText(queryText);
  if (!normQuery) return null;

  // 1. Direct match: check if normalized query is directly equal to any key
  for (const food of GROUNDING_FOODS_DB) {
    for (const key of food.keys) {
      if (normalizeText(key) === normQuery) {
        return food;
      }
    }
  }

  // 2. Contains match: if the query contains the key as a whole word, or vice versa
  const queryWords = normQuery.split(" ");
  
  for (const food of GROUNDING_FOODS_DB) {
    for (const key of food.keys) {
      const normKey = normalizeText(key);
      const keyWords = normKey.split(" ");

      // If key is a single word and is in the query words
      if (keyWords.length === 1 && keyWords[0].length >= 3 && queryWords.includes(keyWords[0])) {
        return food;
      }
      // If query is a single word and is inside key words
      if (queryWords.length === 1 && queryWords[0].length >= 3 && keyWords.includes(queryWords[0])) {
        return food;
      }
      
      // Check full substring containing whole words or very close match
      if (normQuery.includes(normKey) && normKey.length >= 4) {
        return food;
      }
      if (normKey.includes(normQuery) && normQuery.length >= 4) {
        return food;
      }
    }
  }

  // 3. Special Hebrew strip prefixes (e.g. ה, ב, כ) and plural suffixes (ים, ות)
  for (const food of GROUNDING_FOODS_DB) {
    for (const key of food.keys) {
      const normKey = normalizeText(key);
      
      for (const qw of queryWords) {
        if (qw.length < 3) continue;
        
        // Remove Hebrew definitive/preposition prefixes
        let strippedQw = qw;
        if ((qw.startsWith("ה") || qw.startsWith("ו") || qw.startsWith("ב") || qw.startsWith("ל") || qw.startsWith("מ")) && qw.length > 3) {
          strippedQw = qw.substring(1);
        }

        // Check if stripped matches key or vice versa
        if (normKey === strippedQw || normKey.includes(strippedQw) || strippedQw.includes(normKey)) {
          if (strippedQw.length >= 3) {
            return food;
          }
        }
      }
    }
  }

  return null;
}
