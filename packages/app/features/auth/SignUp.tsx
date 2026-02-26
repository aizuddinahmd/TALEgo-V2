import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native'
import { User, Key, Fingerprint, ArrowLeft, Loader2 } from 'lucide-react-native'
import { signUpWithEmail, verifyInvitation, getSession } from '../../api/auth'
import { useRouter } from 'solito/navigation'

export function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          router.replace('/');
        }
      } catch (err) {
        // Ignore errors
      }
    };
    checkSession();
  }, [router]);

  const handleSignUp = async () => {
    if (!email || !token || !password) {
      setError('Please provide all required clearance data.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // 1. Verify invitation
      const isValid = await verifyInvitation(email, token)
      
      if (!isValid) {
        setError('Identity not recognized. Please contact your administrator.')
        setLoading(false)
        return
      }

      // 2. Proceed with sign up
      await signUpWithEmail(email, password)
      
      // On success, navigate to home/overview
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 items-center justify-center p-4 relative bg-black"
    >
      {/* Background Ambience */}
      <View className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <View className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full opacity-50 blur-3xl shadow-[0_0_120px_rgba(202,138,4,0.1)]" />
        <View className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full opacity-50 blur-3xl shadow-[0_0_120px_rgba(88,28,135,0.1)]" />
      </View>

      {/* Sign Up Card */}
      <View className="w-full max-w-md p-8 md:p-12 rounded-[2.5rem] bg-zinc-950/80 border border-yellow-500/20 shadow-2xl z-10 overflow-hidden">
        
        {/* Decoration */}
        <View className="absolute -top-12 left-1/2 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl" style={{ transform: [{ translateX: -48 }] }} />

        {/* Header Logo */}
        <View className="flex-row items-center justify-center mb-10">
          <Image 
            source={Platform.OS === 'web' ? { uri: '/logo-text.png' } : require('../../../../apps/next/public/logo-icon.png')} 
            className="w-14 h-14 object-contain mr-4" 
            resizeMode="contain" 
          />
          <Text className="text-white text-4xl font-bold tracking-tighter shadow-sm shadow-yellow-500/10">
            TALE<Text className="text-brand-gold">go</Text>
          </Text>
        </View>

        {/* Header Texts */}
        <View className="items-center mb-8">
          <Text className="text-xl font-bold text-white tracking-tight mb-2">Secure Registration</Text>
          <Text className="text-zinc-500 text-xs">Establish your clearance credentials.</Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          
          {/* Email Input */}
          <View className={`flex-row items-center bg-black/40 border rounded-xl px-4 py-3 h-[52px] ${error ? 'border-red-500/50' : 'border-white/10 focus:border-yellow-500/50'}`}>
            <User color="#71717A" size={20} className="mr-3" />
            <TextInput
              className="flex-1 text-gray-200 placeholder:text-gray-600 outline-none text-sm"
              placeholder="Authorized Identity"
              placeholderTextColor="#52525B"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* IC Number Input */}
          <View className={`flex-row items-center bg-black/40 border rounded-xl px-4 py-3 h-[52px] mt-4 ${error ? 'border-red-500/50' : 'border-white/10 focus:border-yellow-500/50'}`}>
            <Fingerprint color="#71717A" size={20} className="mr-3" />
            <TextInput
              className="flex-1 text-gray-200 placeholder:text-gray-600 outline-none text-sm"
              placeholder="IC Number / National ID"
              placeholderTextColor="#52525B"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View className={`flex-row items-center bg-black/40 border rounded-xl px-4 py-3 h-[52px] mt-4 ${error ? 'border-red-500/50' : 'border-white/10 focus:border-yellow-500/50'}`}>
            <Key color="#71717A" size={20} className="mr-3" />
            <TextInput
              className="flex-1 text-gray-200 placeholder:text-gray-600 outline-none text-sm"
              placeholder="Create License Key"
              placeholderTextColor="#52525B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 mt-4">
              <Text className="text-red-400 text-xs text-center">{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-xl h-[56px] items-center justify-center flex-row shadow-lg shadow-yellow-500/20 active:shadow-yellow-500/40 mt-6 ${loading ? 'opacity-70 bg-yellow-600' : 'bg-[#D4af37] active:scale-[0.98]'}`}
            onPress={handleSignUp}
            disabled={loading}
            style={{ backgroundColor: '#D4af37' }}
          >
            {loading ? (
              <View className="flex-row items-center">
                <Text className="text-black font-bold text-sm tracking-wide ml-2">ESTABLISHING...</Text>
              </View>
            ) : (
              <Text className="text-black font-bold text-sm tracking-wide">
                ESTABLISH ACCESS
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Link */}
        <View className="flex-row items-center justify-center mt-8 pb-4">
          <Text className="text-zinc-500 text-xs">Already have clearance? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-yellow-500 font-medium text-xs border-b border-transparent hover:border-yellow-500">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Version System Footer */}
      <View className="absolute bottom-6 right-6 flex-row items-center bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 shadow-sm">
        <View className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        <Text className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
          v2.4.10 • SECURE
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}
