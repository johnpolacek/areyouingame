import { ClerkProvider } from '@clerk/nextjs'
import { AccountControls } from './account-controls'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <AccountControls />
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
