import { BreakpointProvider } from 'react-socks'
import { ThemeProvider, defaultTheme } from 'evergreen-ui'

import WaitlistScene from './components/WaitlistScene'

import './styles/reset.css'
import './styles/index.css'

const fontFamily = `'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

export default function App() {
  return (
    <BreakpointProvider>
      <ThemeProvider value={{
        ...defaultTheme,
        fontFamilies: {
          ...(defaultTheme as any).fontFamilies,
          display: fontFamily,
          ui: fontFamily
        }
      }}>
        <WaitlistScene />
      </ThemeProvider>
    </BreakpointProvider>
  )
}
