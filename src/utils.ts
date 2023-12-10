export function formatTelegramMessage(data: { div_input1: string; table_data: string[][] }): string {
  let message = `💳 Saldo: ${data.div_input1.trim()}\n\n📅 Últimas Transações:\n`;

  data.table_data.forEach(([date, place, amount]) => {
    message += `🗓️ Data: ${date}\n🏪 Lugar: ${place}\n💰 Valor: ${amount.trim()}\n\n`;
  });

  return message;
}