import * as React from 'react'
import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Clock,
  ChevronRight
} from 'lucide-react-native'

interface Document {
  id: string
  date: string
  type: string
  status: 'Paid' | 'Pending' | 'Ready'
  netPay?: number
}

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', date: 'Oct 2026', type: 'Payslip', status: 'Paid', netPay: 4763.85 },
  { id: '2', date: 'Sep 2026', type: 'Payslip', status: 'Paid', netPay: 4694.85 },
  { id: '3', date: 'Aug 2026', type: 'Payslip', status: 'Paid', netPay: 4575.85 },
  { id: '4', date: 'Jul 2026', type: 'Payslip', status: 'Paid', netPay: 4575.85 },
  { id: '5', date: '2025', type: 'Tax Form (EA)', status: 'Ready' },
]

export function DocumentVault({ title }: { title: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const years = ['2026', '2025', '2024']

  return (
    <View className="flex-1">
      {/* Header Controls */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-1 max-w-md relative">
          <View className="absolute left-3 top-3 z-10">
            <Search size={18} color="#A3A3A3" />
          </View>
          <TextInput
            placeholder="Search documents..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-900 dark:text-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="flex-row items-center gap-2 ml-4">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">Year:</Text>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              onPress={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg border ${
                selectedYear === year 
                ? 'bg-[#D4AF37] border-[#D4AF37]' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedYear === year ? 'text-black' : 'text-zinc-500'
              }`}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Document Table */}
      <View className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-white/5 shadow-sm overflow-hidden">
        {/* Table Header */}
        <View className="flex-row items-center px-6 py-4 bg-zinc-50 dark:bg-black/20 border-b border-zinc-100 dark:border-white/5">
          <Text className="flex-[1.5] text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</Text>
          <Text className="flex-[2] text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Document Type</Text>
          <Text className="flex-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Status</Text>
          <Text className="flex-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</Text>
        </View>

        {/* Table Body */}
        <View className="divide-y divide-zinc-50 dark:divide-white/5">
          {MOCK_DOCUMENTS.map((doc) => (
            <View 
              key={doc.id}
              className="flex-row items-center px-6 py-5 relative group"
              // @ts-ignore - web-only props for hover preview
              onMouseEnter={() => doc.netPay && setHoveredId(doc.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <View className="flex-[1.5]">
                <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{doc.date}</Text>
              </View>
              
              <View className="flex-[2] flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-[#D4AF3710] items-center justify-center mr-3">
                  <FileText size={16} color="#D4AF37" />
                </View>
                <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{doc.type}</Text>
              </View>

              <View className="flex-1 items-center">
                <View className={`flex-row items-center px-2.5 py-1 rounded-full ${
                  doc.status === 'Paid' ? 'bg-emerald-500/10' : 'bg-[#D4AF3710]'
                }`}>
                  {doc.status === 'Paid' ? (
                    <CheckCircle2 size={12} color="#10B981" />
                  ) : (
                    <Clock size={12} color="#D4AF37" />
                  )}
                  <Text className={`ml-1.5 text-[10px] font-black uppercase ${
                    doc.status === 'Paid' ? 'text-emerald-500' : 'text-[#D4AF37]'
                  }`}>
                    {doc.status}
                  </Text>
                </View>
              </View>

              <View className="flex-1 flex-row justify-end items-center gap-2">
                <TouchableOpacity className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg">
                  <Download size={18} color="#D4AF37" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg">
                  <ExternalLink size={18} color="#D4AF37" />
                </TouchableOpacity>
              </View>

              {/* Quick Preview Pop-up */}
              {hoveredId === doc.id && doc.netPay && (
                <View 
                  className="absolute left-[40%] -top-12 bg-black text-white px-4 py-3 rounded-lg shadow-xl z-50 border border-white/10"
                  style={{ transform: [{ translateX: -50 }] }}
                >
                  <Text className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Estimated Net Pay</Text>
                  <Text className="text-lg font-bold text-[#D4AF37]">RM {doc.netPay.toLocaleString()}</Text>
                  {/* Arrow */}
                  <View className="absolute -bottom-1.5 left-1/2 -ml-1.5 w-3 h-3 bg-black border-r border-b border-white/10 rotate-45" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
