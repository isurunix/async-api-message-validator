'use client'

import { Code } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            AsyncAPI Message Validator v2.0.0 (Next.js)
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Built with Next.js & AsyncAPI Validator
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
