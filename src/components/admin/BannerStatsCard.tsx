
"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Smartphone } from 'lucide-react';

interface BannerStats {
  summary: {
    total_impressions: number;
    total_clicks: number;
    click_through_rate: number;
    revenue_generated: number;
    active_banners: number;
  };
  banners: Array<{
    banner_id: string;
    title: string;
    position: string;
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
  }>;
  daily_stats: Array<{
    date: string;
    impressions: number;
    clicks: number;
    revenue: number;
  }>;
  device_breakdown: {
    mobile: { impressions: number; clicks: number; percentage: number };
    desktop: { impressions: number; clicks: number; percentage: number };
    tablet: { impressions: number; clicks: number; percentage: number };
  };
  position_performance: Record<string, {
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3'];

export default function BannerStatscard() {
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/banners/stats?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Error loading stats:', result.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 h-80 rounded-xl"></div>
          <div className="bg-gray-200 h-80 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">❌ Error cargando estadísticas</div>
        <button 
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const deviceData = [
    { name: 'Móvil', value: stats.device_breakdown.mobile.impressions, percentage: stats.device_breakdown.mobile.percentage },
    { name: 'Desktop', value: stats.device_breakdown.desktop.impressions, percentage: stats.device_breakdown.desktop.percentage },
    { name: 'Tablet', value: stats.device_breakdown.tablet.impressions, percentage: stats.device_breakdown.tablet.percentage }
  ];

  const positionData = Object.entries(stats.position_performance).map(([position, data]) => ({
    position: position.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    impressions: data.impressions,
    clicks: data.clicks,
    ctr: data.ctr
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Impresiones Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.summary.total_impressions)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5% vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Clicks Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.summary.total_clicks)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <MousePointer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8.2% vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">CTR Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.summary.click_through_rate.toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">-0.3% vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.summary.revenue_generated)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+18.7% vs período anterior</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendencia diaria */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Diaria</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).getDate().toString()}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#60B5FF" 
                  strokeWidth={2}
                  name="Impresiones"
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#FF9149" 
                  strokeWidth={2}
                  name="Clicks"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por dispositivo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Dispositivo</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [formatNumber(value as number), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {deviceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">
                  {entry.name}: {entry.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rendimiento por posición */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Posición</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="position" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="impressions" fill="#60B5FF" name="Impresiones" />
              <Bar dataKey="clicks" fill="#FF9149" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de rendimiento de banners */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Banners por Rendimiento</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impresiones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.banners.map((banner) => (
                <tr key={banner.banner_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {banner.position.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(banner.impressions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(banner.clicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      banner.ctr >= 2.5 ? 'bg-green-100 text-green-800' :
                      banner.ctr >= 1.5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {banner.ctr.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(banner.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
