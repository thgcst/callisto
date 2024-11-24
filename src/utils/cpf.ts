export function isValidCpf(cpf?: string): boolean {
  if (typeof cpf !== "string") return false;

  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const cpfArray = cpf.split("").map((el) => +el);

  const rest = (count: number): number =>
    ((cpfArray
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
      11) %
    10;

  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
}

export function generateCpf(): string {
  function randomNum(): number {
    return Math.floor(Math.random() * 9);
  }

  function calculateDigit(cpfArray: number[], factor: number): number {
    const sum: number = cpfArray.reduce(
      (acc, val, i) => acc + val * (factor - i),
      0,
    );
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  }

  const cpfArray: number[] = Array.from({ length: 9 }, randomNum);

  const firstVerifier: number = calculateDigit(cpfArray, 10);
  cpfArray.push(firstVerifier);

  const secondVerifier: number = calculateDigit(cpfArray, 11);
  cpfArray.push(secondVerifier);

  return cpfArray.join("");
}
