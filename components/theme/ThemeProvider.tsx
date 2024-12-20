'use client'

import { ReactNode, useEffect } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemPreference

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return children
}

// Custom hook for theme management
export function useTheme() {
  // TODO: Implement custom hook for next-themes
  // For now, this will throw an error
  throw new Error('useTheme is not implemented for next-themes')
}
