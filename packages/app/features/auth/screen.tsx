import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { User, Key, ArrowLeft, Check, Crown } from 'lucide-react-native'
import { signInWithEmail } from '../../api/auth'
import { useRouter } from 'solito/navigation'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your identity and license key.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await signInWithEmail(email, password)
      // On success, navigate to home/overview
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black items-center justify-center p-4 relative"
    >
      {/* Glow Effect Background for Card */}
      <View
        className="absolute w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-3xl opacity-50"
        style={{ transform: [{ scale: 1.5 }] }}
      />

      {/* Login Card */}
      <View className="w-full max-w-md bg-zinc-950/80 rounded-3xl p-8 border border-zinc-800/50 shadow-2xl z-10">
        
        {/* Header Logo */}
        <View className="flex-row items-center justify-center mb-10">
          <Crown color="#EAB308" size={32} strokeWidth={2} className="mr-3" />
          <Text className="text-white text-3xl font-bold tracking-wider">
            TALE<Text className="text-yellow-500">track</Text>
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          className="flex-row items-center mb-6 opacity-70 hover:opacity-100"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#A1A1AA" size={16} className="mr-2" />
          <Text className="text-zinc-400 text-sm font-medium">Back</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View className="space-y-4">
          
          {/* Email Input */}
          <View className="flex-row items-center bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 h-14">
            <User color="#A1A1AA" size={20} className="mr-3" />
            <TextInput
              className="flex-1 text-zinc-100 placeholder:text-zinc-600 outline-none text-base"
              placeholder="Authorized Identity"
              placeholderTextColor="#52525B"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 h-14">
            <Key color="#A1A1AA" size={20} className="mr-3" transform={[{ rotate: '45deg' }]} />
            <TextInput
              className="flex-1 text-zinc-100 placeholder:text-zinc-600 outline-none text-base"
              placeholder="Secure License Key"
              placeholderTextColor="#52525B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {error && (
            <Text className="text-red-500 text-sm text-center font-medium mt-2">{error}</Text>
          )}

          {/* Remember Me Toggle */}
          <TouchableOpacity
            className="flex-row items-center mt-2 mb-6"
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <View className={`w-5 h-5 rounded border items-center justify-center mr-3 ${rememberMe ? 'bg-yellow-500 border-yellow-500' : 'bg-zinc-900 border-zinc-700'}`}>
              {rememberMe && <Check color="#000" size={12} strokeWidth={3} />}
            </View>
            <Text className="text-zinc-400 text-sm font-medium">Remember me on this device</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-yellow-500 rounded-xl h-14 items-center justify-center flex-row shadow-[0_0_15px_rgba(234,179,8,0.3)] shadow-yellow-500/30 ${loading ? 'opacity-70' : 'active:scale-[0.98]'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-bold text-base tracking-widest">
                INITIATE SYSTEM
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* System Status Footer */}
      <View className="absolute bottom-6 right-6 flex-row items-center bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
        <View className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        <Text className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
          System Ready v2.4.50
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}
