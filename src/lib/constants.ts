export const BRANCHES = ["VINAYAK 1 SHIVAM", "VINAYAK 2 RAILWAY EAST"] as const;
export const STANDARDS = ["9", "10", "11", "12"] as const;
export const SUBJECTS_BY_STANDARD: Record<string, string[]> = {
  "9": ["English", "Maths", "Social Science", "Science"],
  "10": ["English", "Maths", "Social Science", "Science"],
  "11": ["English", "Account", "Business Administration", "Economics", "Statistics"],
  "12": ["English", "Account", "Business Administration", "Economics", "Statistics"]
};
