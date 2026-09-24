export interface FoodItem {
  aliases: string[];
  rishona: string;
  acharona: string;
}

export const foodDatabase: FoodItem[] = [
  { aliases: ["pizza", "pizza slice"], rishona: "bracha-mezonot", acharona: "bracha-al-hamichya" },
  { aliases: ["bread", "challah", "pita", "bagel", "roll"], rishona: "bracha-hamotzi", acharona: "bracha-birkat-hamazon" },
  { aliases: ["wine", "grape juice"], rishona: "bracha-hagefen", acharona: "bracha-al-hagefen" },
  { aliases: ["grape", "grapes", "raisin", "raisins", "olive", "olives", "date", "dates", "fig", "figs", "pomegranate"], rishona: "bracha-haetz", acharona: "bracha-al-haetz" },
  { aliases: ["apple", "orange", "pear", "peach", "plum", "cherry", "mango", "avocado"], rishona: "bracha-haetz", acharona: "bracha-borei-nefashot" },
  { aliases: ["banana", "bananas", "strawberry", "strawberries", "pineapple", "pineapples", "melon", "melons", "watermelon", "watermelons", "cucumber", "cucumbers", "tomato", "tomatoes", "potato", "potatoes", "carrot", "carrots", "corn", "peas", "salad", "lettuce", "onion", "onions", "cilantro", "parsley", "basil", "bean", "beans"], rishona: "bracha-haadama", acharona: "bracha-borei-nefashot" },
  { aliases: ["rice"], rishona: "bracha-mezonot", acharona: "bracha-borei-nefashot" },
  { aliases: ["cake", "cookie", "cookies", "cracker", "crackers", "pretzel", "pretzels", "pasta", "penne pasta", "noodles", "waffle", "waffle cone", "cone", "pancake", "cereal", "biscuit", "biscuit base", "barley", "cholent"], rishona: "bracha-mezonot", acharona: "bracha-al-hamichya" },
  { aliases: ["oatmeal", "porridge"], rishona: "bracha-mezonot", acharona: "bracha-al-hamichya" },
  { aliases: ["water", "milk", "juice", "soda", "coffee", "tea", "chicken", "chicken schnitzel", "schnitzel", "meat", "beef", "fish", "egg", "eggs", "cheese", "yogurt", "ice cream", "vanilla ice cream", "chocolate", "candy", "nut", "nuts", "almond", "almonds", "walnut", "walnuts", "peanut", "peanuts", "cashew", "cashews", "soup", "broth", "syrup", "sauce", "tomato sauce", "ketchup", "mayonnaise", "mustard", "marshmallow", "marshmallow treat", "chocolate covered marshmallow treat"], rishona: "bracha-shehakol", acharona: "bracha-borei-nefashot" }
];

export const blessingNames: Record<string, string> = {
  "bracha-hamotzi": "Hamotzi",
  "bracha-mezonot": "Mezonot",
  "bracha-hagefen": "Hagefen",
  "bracha-haetz": "Haetz",
  "bracha-haadama": "Haadama",
  "bracha-shehakol": "Shehakol",
  "bracha-birkat-hamazon": "Birkat Hamazon",
  "bracha-al-hamichya": "Al Hamichya",
  "bracha-al-hagefen": "Al Hagefen",
  "bracha-al-haetz": "Al Haetz",
  "bracha-borei-nefashot": "Borei Nefashot"
};

export const orderMap: Record<string, number> = {
  "bracha-hamotzi": 1,
  "bracha-mezonot": 2,
  "bracha-hagefen": 3,
  "bracha-haetz": 4,
  "bracha-haadama": 5,
  "bracha-shehakol": 6
};

export function formatBlessingLink(id: string): string {
  return `[${blessingNames[id]}](#${id})`;
}

export function isIngredientInDatabase(name: string): boolean {
  const lowerName = name.toLowerCase();
  for (const food of foodDatabase) {
    for (const alias of food.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lowerName) || lowerName === alias) {
        return true;
      }
    }
  }
  return false;
}

export function findFood(name: string): { rishona: string; acharona: string } {
  const lowerName = name.toLowerCase();
  
  // Sort all possible matches by length (longest first) to prevent partial matching (e.g. pineapple matching apple)
  let bestMatch = null;
  let maxAliasLength = 0;

  for (const food of foodDatabase) {
    for (const alias of food.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if ((regex.test(lowerName) || lowerName === alias) && alias.length > maxAliasLength) {
        bestMatch = { rishona: food.rishona, acharona: food.acharona };
        maxAliasLength = alias.length;
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // Default to shehakol if unknown
  return { rishona: "bracha-shehakol", acharona: "bracha-borei-nefashot" };
}
