"use client"

import * as React from "react"

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  attribute = 'data-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  
  React.useEffect(() => {
    const root = window.document.documentElement
    
    // İlk yükleme için localStorage'dan tema alınması
    const savedTheme = window.localStorage.getItem(storageKey) as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
    
    // Tema değişikliği izleme
    const applyTheme = (newTheme: Theme) => {
      const resolvedTheme = newTheme === 'system' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : newTheme
      
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      root.setAttribute(attribute, resolvedTheme)
    }
    
    applyTheme(theme)
    
    // Sistem teması değişikliğini izle
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, storageKey, attribute])
  
  const value = React.useMemo(() => {
    return {
      theme,
      setTheme: (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      },
    }
  }, [theme, storageKey])
  
  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}
