export function calculateAQL(loteSize: number) {
  if (loteSize < 2) return { n: 1, ac: 0, re: 1 };
  if (loteSize <= 8) return { n: 2, ac: 0, re: 1 };
  if (loteSize <= 15) return { n: 3, ac: 0, re: 1 };
  if (loteSize <= 25) return { n: 5, ac: 0, re: 1 };
  if (loteSize <= 50) return { n: 8, ac: 0, re: 1 };
  if (loteSize <= 90) return { n: 13, ac: 0, re: 1 };
  if (loteSize <= 150) return { n: 20, ac: 1, re: 2 };
  if (loteSize <= 280) return { n: 32, ac: 1, re: 2 };
  if (loteSize <= 500) return { n: 50, ac: 2, re: 3 };
  if (loteSize <= 1200) return { n: 80, ac: 3, re: 4 };
  if (loteSize <= 3200) return { n: 125, ac: 5, re: 6 };
  return { n: 200, ac: 7, re: 8 }; // > 3200
}
