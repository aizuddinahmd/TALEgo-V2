import 'moti'
import 'react-native'
import 'lucide-react-native'
import { SvgProps } from 'react-native-svg'
import { ReactNode } from 'react'

declare module 'moti' {
  interface MotiPropsBase {
    className?: string
  }
}

declare module 'react-native' {
  interface ViewProps {
    className?: string
  }
  interface TextProps {
    className?: string
  }
  interface TouchableOpacityProps {
    className?: string
  }
  interface PressableProps {
    className?: string
  }
  interface ScrollViewProps {
    className?: string
    contentContainerClassName?: string
  }
  interface FlatListProps<ItemT> {
    className?: string
    contentContainerClassName?: string
  }
  interface SectionListProps<ItemT, SectionT> {
    className?: string
    contentContainerClassName?: string
  }
  interface TextInputProps {
    className?: string
  }
  interface ImageProps {
    className?: string
  }
}

declare module 'lucide-react-native' {
  interface LucideProps extends SvgProps {
    size?: string | number
    color?: string
    strokeWidth?: string | number
    children?: ReactNode
    className?: string
  }
}
