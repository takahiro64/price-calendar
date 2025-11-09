export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

export function getAirportName(code: string): string {
  const airports: Record<string, string> = {
    HND: '羽田',
    NRT: '成田',
    KIX: '関西',
    ITM: '伊丹',
    CTS: '新千歳',
    FUK: '福岡',
    OKA: '那覇',
    NGO: '中部',
    KOJ: '鹿児島',
    SDJ: '仙台',
  };
  return airports[code] || code;
}

export function getDaysUntilDeparture(departureDate: string): number {
  const departure = new Date(departureDate);
  const today = new Date();
  const diff = departure.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
