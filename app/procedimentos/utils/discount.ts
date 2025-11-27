/**
 * Aplica um desconto de 10% ao valor fornecido
 * @param value Valor original
 * @returns Valor com desconto de 10%
 */
export function applyDiscount(value: number): number {
  return value * 0.9 // 100% - 10% = 90% = 0.9
}

/**
 * Formata um valor monetário para exibição
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 10,50)
 */
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}

/**
 * Formata um valor monetário com desconto para exibição
 * @param value Valor original
 * @returns String formatada com o valor com desconto (ex: R$ 10,50)
 */
export function formatDiscountedValue(value: number): string {
  return formatCurrency(applyDiscount(value))
}
