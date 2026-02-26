import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Eye, EyeOff, FileText, ChevronRight } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PayBreakdownProps {
  period: string;
  netPay: number;
  grossPay: number;
  deductions: number;
  onViewDetails?: () => void;
  onDownload?: () => void;
}

export const PayBreakdownCard = ({
  period,
  netPay,
  grossPay,
  deductions,
  onViewDetails,
  onDownload,
}: PayBreakdownProps) => {
  const [isPrivate, setIsPrivate] = useState(false);

  // Formatter for Currency
  const formatCurrency = (amount: number) => {
    if (isPrivate) return 'RM ••••';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 mb-4 overflow-hidden">
      {/* Header: Period & Privacy Toggle */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            Pay Period
          </Text>
          <Text className="text-slate-900 dark:text-slate-50 font-bold text-lg">{period}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsPrivate(!isPrivate)}
          className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full"
        >
          {isPrivate ? <Eye size={20} color="#64748b" /> : <EyeOff size={20} color="#64748b" />}
        </TouchableOpacity>
      </View>

      {/* Main Stats */}
      <View className="flex-row justify-between items-end mb-6">
        <View>
          <Text className="text-slate-500 dark:text-slate-400 text-xs mb-1">Net Take-home Pay</Text>
          <Text className="text-blue-600 dark:text-blue-400 font-extrabold text-3xl">
            {formatCurrency(netPay)}
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
            <Text className="text-green-700 dark:text-green-400 text-[10px] font-bold uppercase">Status: Paid</Text>
          </View>
        </View>
      </View>

      {/* Breakdown Row */}
      <View className="flex-row border-t border-slate-100 dark:border-zinc-800 pt-4 mb-6">
        <View className="flex-1">
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Gross Pay</Text>
          <Text className="text-slate-700 dark:text-slate-300 font-semibold">{formatCurrency(grossPay)}</Text>
        </View>
        <View className="w-[1px] bg-slate-100 dark:bg-zinc-800 mx-4" />
        <View className="flex-1">
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Deductions</Text>
          <Text className="text-red-500 dark:text-red-400 font-semibold">-{formatCurrency(deductions)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          onPress={onDownload}
          className="flex-1 flex-row items-center justify-center bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 active:bg-blue-800 py-3 rounded-xl transition-colors"
        >
          <FileText size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold">PDF Payslip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onViewDetails}
          className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 active:bg-slate-300 dark:hover:bg-zinc-700 p-3 rounded-xl transition-colors"
        >
          <ChevronRight size={24} color="#64748b" className="dark:text-slate-400" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
