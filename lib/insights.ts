// Rule-based AI Insights Engine
// Analyzes actual database records to generate business insights

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'prediction';
  category: 'sales' | 'inventory' | 'employee' | 'store' | 'forecast';
  title: string;
  description: string;
  value?: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
}

export function generateInsights(data: {
  topProducts: Array<{ name: string; articleCode: string; totalQty: number; totalRevenue: number }>;
  categoryBreakdown: Array<{ category: string; totalQty: number; totalRevenue: number }>;
  storePerformance: Array<{ storeName: string; storeCode: string; totalRevenue: number; totalItems: number }>;
  lowStockProducts: Array<{ name: string; articleCode: string; totalStock: number; minStock: number }>;
  monthlySales: Array<{ month: string; revenue: number }>;
  totalEmployees: number;
  pendingLeaves: number;
}): Insight[] {
  const insights: Insight[] = [];
  const { topProducts, categoryBreakdown, storePerformance, lowStockProducts, monthlySales, totalEmployees, pendingLeaves } = data;

  // Best selling category
  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    const totalUnits = categoryBreakdown.reduce((s, c) => s + c.totalQty, 0);
    const percentage = totalUnits > 0 ? Math.round((topCategory.totalQty / totalUnits) * 100) : 0;
    insights.push({
      id: 'best-category',
      type: 'success',
      category: 'sales',
      title: `${topCategory.category} adalah kategori terlaris`,
      description: `${topCategory.category} menyumbang ${percentage}% dari total unit terjual minggu ini dengan ${topCategory.totalQty} unit.`,
      value: `${percentage}%`,
      percentage,
      trend: 'up',
      priority: 'high',
    });
  }

  // Top performing store
  if (storePerformance.length > 0) {
    const topStore = storePerformance[0];
    insights.push({
      id: 'top-store',
      type: 'success',
      category: 'store',
      title: `Toko ${topStore.storeName} performa terbaik`,
      description: `Toko ${topStore.storeName} menghasilkan pendapatan tertinggi bulan ini dengan ${topStore.totalItems} item terjual.`,
      value: formatRupiahSimple(topStore.totalRevenue),
      trend: 'up',
      priority: 'high',
    });
  }

  // Top product
  if (topProducts.length > 0) {
    const topProduct = topProducts[0];
    insights.push({
      id: 'top-product',
      type: 'info',
      category: 'sales',
      title: `Produk terlaris: ${topProduct.articleCode}`,
      description: `${topProduct.name} adalah artikel paling banyak terjual dengan ${topProduct.totalQty} unit terjual.`,
      value: `${topProduct.totalQty} unit`,
      trend: 'up',
      priority: 'medium',
    });
  }

  // Low stock warning
  if (lowStockProducts.length > 0) {
    const critical = lowStockProducts.filter(p => p.totalStock <= p.minStock);
    if (critical.length > 0) {
      insights.push({
        id: 'low-stock',
        type: 'warning',
        category: 'inventory',
        title: `${critical.length} produk mendekati batas stok minimum`,
        description: `Produk berikut memerlukan pengisian stok segera: ${critical.slice(0, 3).map(p => p.articleCode).join(', ')}${critical.length > 3 ? ` dan ${critical.length - 3} lainnya` : ''}.`,
        value: `${critical.length} produk`,
        priority: 'high',
      });
    }
  }

  // Revenue forecast (simple linear trend)
  if (monthlySales.length >= 3) {
    const recentMonths = monthlySales.slice(-3);
    const avg = recentMonths.reduce((s, m) => s + m.revenue, 0) / recentMonths.length;
    const lastMonth = recentMonths[recentMonths.length - 1].revenue;
    const secondLast = recentMonths[recentMonths.length - 2].revenue;
    const trendFactor = lastMonth > 0 ? (lastMonth - secondLast) / lastMonth : 0;
    const forecast = avg * (1 + trendFactor * 0.5);
    const trendLabel = trendFactor > 0.05 ? 'meningkat' : trendFactor < -0.05 ? 'menurun' : 'stabil';

    insights.push({
      id: 'revenue-forecast',
      type: 'prediction',
      category: 'forecast',
      title: `Estimasi pendapatan bulan depan`,
      description: `Berdasarkan tren 3 bulan terakhir yang ${trendLabel}, estimasi pendapatan bulan depan adalah sekitar ${formatRupiahSimple(forecast)}. Ini adalah perkiraan, bukan angka pasti.`,
      value: formatRupiahSimple(forecast),
      trend: trendFactor > 0.05 ? 'up' : trendFactor < -0.05 ? 'down' : 'stable',
      priority: 'medium',
    });
  }

  // Pending leave alert
  if (pendingLeaves > 0) {
    insights.push({
      id: 'pending-leaves',
      type: 'warning',
      category: 'employee',
      title: `${pendingLeaves} pengajuan cuti menunggu persetujuan`,
      description: `Terdapat ${pendingLeaves} pengajuan cuti karyawan yang belum ditinjau. Segera proses untuk menjaga kelancaran operasional.`,
      value: `${pendingLeaves} pengajuan`,
      priority: 'medium',
    });
  }

  // Store comparison insight
  if (storePerformance.length >= 2) {
    const best = storePerformance[0];
    const worst = storePerformance[storePerformance.length - 1];
    const diff = best.totalRevenue > 0 ? Math.round(((best.totalRevenue - worst.totalRevenue) / best.totalRevenue) * 100) : 0;
    if (diff > 20) {
      insights.push({
        id: 'store-gap',
        type: 'info',
        category: 'store',
        title: `Kesenjangan performa antar toko`,
        description: `Toko ${best.storeName} menghasilkan ${diff}% lebih tinggi dari toko ${worst.storeName}. Pertimbangkan untuk menganalisis faktor penyebabnya.`,
        value: `${diff}% gap`,
        trend: 'stable',
        priority: 'low',
      });
    }
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function formatRupiahSimple(amount: number): string {
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`;
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}Rb`;
  return `Rp ${amount}`;
}
