'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw, Zap, Package, Store, Users, AlertTriangle } from 'lucide-react';
import { generateInsights, type Insight } from '@/lib/insights';

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats?period=monthly');
      const json = await res.json();
      setData(json);
      const generatedInsights = generateInsights({
        topProducts: json.topProducts || [],
        categoryBreakdown: json.categoryBreakdown || [],
        storePerformance: json.salesByStore || [],
        lowStockProducts: json.lowStockProducts || [],
        monthlySales: json.monthlyTrend || [],
        totalEmployees: json.activeEmployees || 0,
        pendingLeaves: json.pendingLeaves || 0,
      });
      setInsights(generatedInsights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInsights(); }, []);

  const insightTypeConfig = {
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: TrendingUp, iconColor: 'text-green-600', badge: 'bg-green-100 text-green-800' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: BarChart3, iconColor: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
    prediction: { bg: 'bg-purple-50', border: 'border-purple-200', icon: Zap, iconColor: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
  };

  const categoryIcons: Record<string, React.ElementType> = {
    sales: TrendingUp,
    inventory: Package,
    store: Store,
    employee: Users,
    forecast: Zap,
  };

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-600' },
    down: { icon: TrendingDown, color: 'text-red-600' },
    stable: { icon: Minus, color: 'text-gray-500' },
  };

  const priorityLabels = { high: 'Prioritas Tinggi', medium: 'Menengah', low: 'Rendah' };
  const priorityColors = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-gray-100 text-gray-700' };

  return (
    <div>
      <TopBar title="AI Business Insights" breadcrumbs={[{ label: 'Owner' }, { label: 'AI Insights' }]} />

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-gray-900">AI Business Insights</h1>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">Rule-Based Engine</span>
            </div>
            <p className="text-sm text-gray-500">
              Wawasan bisnis berbasis data aktual. Sistem menganalisis catatan penjualan, inventaris, dan SDM secara otomatis.
            </p>
          </div>
          <button onClick={loadInsights} disabled={loading} className="btn-outline text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Perbarui
          </button>
        </div>

        {/* AI Disclaimer */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-purple-700">
            <strong>ℹ️ Catatan:</strong> Semua insight dihasilkan oleh rule-based analytics engine menggunakan data aktual dari database. Prediksi ditandai dengan jelas dan merupakan estimasi berdasarkan tren historis, bukan angka pasti. Sistem ini dapat diintegrasikan dengan API AI eksternal (OpenAI, dsb.) di masa mendatang.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 skeleton rounded-lg" />)}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="h-10 w-10 mx-auto mb-3" />
            <p>Belum cukup data untuk menghasilkan insights.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => {
              const config = insightTypeConfig[insight.type];
              const Icon = config.icon;
              const CategoryIcon = categoryIcons[insight.category] || BarChart3;
              const trendCfg = insight.trend ? trendConfig[insight.trend] : null;
              const TrendIcon = trendCfg?.icon;

              return (
                <div key={insight.id} className={`rounded-lg border ${config.border} ${config.bg} p-5`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-white/60 flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 items-center mb-1">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${config.badge}`}>
                            {insight.type === 'prediction' ? 'Prediksi' : insight.type === 'success' ? 'Positif' : insight.type === 'warning' ? 'Peringatan' : 'Informasi'}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${priorityColors[insight.priority]}`}>
                            {priorityLabels[insight.priority]}
                          </span>
                          <CategoryIcon className="h-3 w-3 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">{insight.title}</h3>
                      </div>
                    </div>
                    {insight.value && (
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg font-bold ${config.iconColor}`}>{insight.value}</p>
                        {trendCfg && TrendIcon && (
                          <div className={`flex items-center justify-end gap-0.5 ${trendCfg.color}`}>
                            <TrendIcon className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Raw Data Summary */}
        {data && !loading && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ringkasan Data Analisis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-500">Periode</p>
                <p className="font-medium text-gray-800">Bulan ini</p>
              </div>
              <div>
                <p className="text-gray-500">Produk Dianalisis</p>
                <p className="font-medium text-gray-800">{data.topProducts?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Kategori</p>
                <p className="font-medium text-gray-800">{data.categoryBreakdown?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Insight Dihasilkan</p>
                <p className="font-medium text-gray-800">{insights.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
