export function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.length === 10) {
    return phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phoneNumber.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export function formatCep(cep: string) {
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
}
