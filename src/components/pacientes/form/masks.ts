// Máscaras de digitação para campos com formato fixo no Brasil — formata o
// valor a cada tecla digitada, então é fisicamente impossível o usuário
// digitar mais dígitos do que o campo permite (evita erro de troca de
// dígito/copiar-colar errado que passaria despercebido num texto livre).

function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function formatarCPF(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// RG não tem um formato único nacional (varia por estado) — só limita o
// tamanho de dígitos a uma faixa realista, sem forçar máscara de pontuação.
export function formatarRG(valor: string) {
  return valor.replace(/[^0-9Xx]/g, "").slice(0, 9).toUpperCase();
}

// Cartão Nacional de Saúde: sempre 15 dígitos, formato oficial 000 0000 0000 0000.
export function formatarCNS(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 15);
  const grupos = [
    digitos.slice(0, 3),
    digitos.slice(3, 7),
    digitos.slice(7, 11),
    digitos.slice(11, 15),
  ].filter(Boolean);
  return grupos.join(" ");
}

// Telefone fixo: (00) 0000-0000 — 10 dígitos.
export function formatarTelefoneFixo(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 10);
  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// Celular: (00) 00000-0000 — 11 dígitos.
export function formatarCelular(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

// CNPJ: 00.000.000/0000-00 — 14 dígitos.
export function formatarCNPJ(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 14);
  return digitos
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

// CEP: 00000-000 — 8 dígitos.
export function formatarCEP(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 8);
  return digitos.replace(/(\d{5})(\d)/, "$1-$2");
}

export function contarDigitos(valor: string) {
  return apenasDigitos(valor).length;
}
