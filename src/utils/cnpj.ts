export function isValidCnpj(cnpj?: string): boolean {
  if (typeof cnpj !== "string") return false;

  cnpj = cnpj.replace(/[^\d]+/g, "");

  if (cnpj.length !== 14) return false;

  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (cnpjPart: string, weight: number[]): number => {
    const sum = cnpjPart
      .split("")
      .map((num, idx) => parseInt(num, 10) * weight[idx])
      .reduce((acc, curr) => acc + curr, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstWeight = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeight = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const baseCNPJ = cnpj.slice(0, 12);
  const firstDigit = calculateDigit(baseCNPJ, firstWeight);
  const secondDigit = calculateDigit(baseCNPJ + firstDigit, secondWeight);

  return cnpj === baseCNPJ + firstDigit + secondDigit;
}

export function generateCnpj(): string {
  function randomDigit() {
    return Math.floor(Math.random() * 10);
  }

  function generateCNPJBase(): number[] {
    const cnpjBase: number[] = [];

    for (let i: number = 0; i < 8; i++) {
      cnpjBase.push(randomDigit());
    }

    return [...cnpjBase, 0, 0, 0, 1];
  }

  function calculateFirstVerifier(cnpjBase: number[]): number {
    const weight: number[] = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum: number = 0;

    for (let i: number = 0; i < 12; i++) {
      sum += cnpjBase[i] * weight[i];
    }

    const remainder: number = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  }

  function calculateSecondVerifier(
    cnpjBase: number[],
    firstVerifier: number,
  ): number {
    const weight: number[] = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum: number = 0;

    for (let i: number = 0; i < 12; i++) {
      sum += cnpjBase[i] * weight[i];
    }

    sum += firstVerifier * weight[12];

    const remainder: number = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  }

  const cnpjBase: number[] = generateCNPJBase();

  const firstVerifier: number = calculateFirstVerifier(cnpjBase);

  const secondVerifier: number = calculateSecondVerifier(
    cnpjBase.concat(firstVerifier),
    firstVerifier,
  );

  return `${cnpjBase.join("")}${String(firstVerifier)}${String(secondVerifier)}`;
}
