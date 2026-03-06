import { Provider } from 'app/provider'
import { StylesProvider } from './styles-provider'
import '../app/globals.css'
import { ConditionalSidebar } from './conditional-sidebar'
import { AuthGuard } from './auth-guard'

export const metadata = {
  title: 'TALEgo',
  description: 'HR Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StylesProvider>
          <Provider>
            <AuthGuard>
              <div className="flex h-screen w-full text-white selection:bg-brand-gold selection:text-black overflow-hidden relative">
                <ConditionalSidebar />
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative z-10 h-full overflow-y-auto">
                  <main className="flex-1 flex flex-col w-full relative">
                    {children}
                  </main>
                </div>
              </div>
            </AuthGuard>
          </Provider>
        </StylesProvider>
      </body>
    </html>
  )
}
