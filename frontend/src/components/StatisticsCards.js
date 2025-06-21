import React from 'react';
import { Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const StatisticsCards = ({ stats }) => {
  const statisticsConfig = [
    {
      id: 'total',
      title: 'Tổng phiếu',
      value: stats.total,
      icon: Package,
      gradient: 'from-blue-500/10 to-purple-500/10',
      border: 'border-blue-200/50',
      iconColor: 'text-blue-500'
    },
    {
      id: 'pending',
      title: 'Chờ xử lý',
      value: stats.pending,
      icon: Clock,
      gradient: 'from-yellow-500/10 to-orange-500/10',
      border: 'border-yellow-200/50',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'received',
      title: 'Hoàn thành',
      value: stats.received,
      icon: CheckCircle,
      gradient: 'from-green-500/10 to-teal-500/10',
      border: 'border-green-200/50',
      iconColor: 'text-green-500'
    },
    {
      id: 'totalValue',
      title: 'Tổng giá trị',
      value: formatCurrency(stats.totalValue),
      icon: TrendingUp,
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-200/50',
      iconColor: 'text-purple-500',
      colSpan: 'col-span-2 lg:col-span-1'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {statisticsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`card card-body bg-gradient-to-r ${stat.gradient} ${stat.border} p-4 ${stat.colSpan || ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className={`font-bold text-gray-900 ${
                  stat.id === 'totalValue' ? 'text-base sm:text-lg' : 'text-xl sm:text-3xl'
                }`}>
                  {stat.value}
                </p>
              </div>
              <Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards; 