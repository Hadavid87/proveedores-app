export function calculateAQL(loteSize: number) {
  let letter = 'A', n = 2;
  
  if (loteSize >= 2 && loteSize <= 8) { letter = 'A'; n = 2; }
  else if (loteSize >= 9 && loteSize <= 15) { letter = 'B'; n = 3; }
  else if (loteSize >= 16 && loteSize <= 25) { letter = 'C'; n = 5; }
  else if (loteSize >= 26 && loteSize <= 50) { letter = 'D'; n = 8; }
  else if (loteSize >= 51 && loteSize <= 90) { letter = 'E'; n = 13; }
  else if (loteSize >= 91 && loteSize <= 150) { letter = 'F'; n = 20; }
  else if (loteSize >= 151 && loteSize <= 280) { letter = 'G'; n = 32; }
  else if (loteSize >= 281 && loteSize <= 500) { letter = 'H'; n = 50; }
  else if (loteSize >= 501 && loteSize <= 1200) { letter = 'J'; n = 80; }
  else if (loteSize >= 1201 && loteSize <= 3200) { letter = 'K'; n = 125; }
  else if (loteSize >= 3201 && loteSize <= 10000) { letter = 'L'; n = 200; }
  else if (loteSize > 10000) { letter = 'M'; n = 315; }
  else { letter = 'A'; n = 1; } // Lote = 1

  // AQL 1.5 (Mayores)
  let mayoresAc = 0, mayoresRe = 1;
  if (n >= 32) mayoresAc = 1;
  if (n >= 50) mayoresAc = 2; // Approximations for AQL 1.5
  if (n >= 80) mayoresAc = 3;
  if (n >= 125) mayoresAc = 5;
  if (n >= 200) mayoresAc = 7;
  if (n >= 315) mayoresAc = 10;
  mayoresRe = mayoresAc + 1;

  // AQL 4.0 (Menores)
  let menoresAc = 0, menoresRe = 1;
  if (n >= 5) menoresAc = 1;
  if (n >= 8) menoresAc = 1; 
  if (n >= 13) menoresAc = 1; 
  if (n >= 20) menoresAc = 2;
  if (n >= 32) menoresAc = 3;
  if (n >= 50) menoresAc = 5;
  if (n >= 80) menoresAc = 7;
  if (n >= 125) menoresAc = 10;
  if (n >= 200) menoresAc = 14;
  if (n >= 315) menoresAc = 21;
  menoresRe = menoresAc + 1;

  return {
    letter,
    n,
    criticos: { ac: 0, re: 1 },
    mayores: { ac: mayoresAc, re: mayoresRe },
    menores: { ac: menoresAc, re: menoresRe }
  };
}
