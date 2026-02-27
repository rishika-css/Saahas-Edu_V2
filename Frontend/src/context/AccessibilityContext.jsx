import { createContext, useState, useContext } from 'react'

const AccessibilityContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('normal')
  const [dyslexiaFont, setDyslexiaFont] = useState(false)
  const [adhdFocus, setAdhdFocus] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const containerClasses = [
    'min-h-screen',
    highContrast ? 'bg-black text-white' : '',
    darkMode ? 'bg-gray-900 text-gray-100' : '',
    dyslexiaFont ? 'font-[Lexend]' : '',
  ].filter(Boolean).join(' ')

  return (
    <AccessibilityContext.Provider value={{
      highContrast, setHighContrast,
      fontSize, setFontSize,
      dyslexiaFont, setDyslexiaFont,
      adhdFocus, setAdhdFocus,
      darkMode, setDarkMode,
    }}>
      <div className={containerClasses}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => useContext(AccessibilityContext)