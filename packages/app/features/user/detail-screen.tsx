import { View, Text, Pressable } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
import { useTheme } from 'app/provider/theme'

export function UserDetailScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const { colorMode, toggleColorMode, themeMode, toggleTheme } = useTheme()

  return (
    <View className="flex-1 justify-center items-center bg-zinc-900 w-full p-4 space-y-6">
      <Pressable onPress={() => router.back()} className="mb-8">
        <Text className="text-white text-lg">👈 welcome, {params?.get('id')}! (press me to go back)</Text>
      </Pressable>
      
      <View className="flex gap-4 w-full max-w-sm">
        <Pressable 
            className="bg-black/40 p-4 rounded-lg items-center"
            onPress={() => toggleColorMode(colorMode === 'dark' ? 'light' : 'dark')}
        >
            <Text className="text-brand-gold font-bold text-base">
                Switch to {colorMode === 'dark' ? 'Light' : 'Dark'} Mode
            </Text>
        </Pressable>

        <Pressable 
            className="bg-black/40 p-4 rounded-lg items-center"
            onPress={() => toggleTheme(themeMode === 'classic' ? 'neo' : 'classic')}
        >
            <Text className="text-brand-gold font-bold text-base">
                Switch to {themeMode === 'classic' ? 'Neo (Glass)' : 'Classic'} Style
            </Text>
        </Pressable>
      </View>
    </View>
  )
}
