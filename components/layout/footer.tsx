import Link from 'next/link'

export function Footer({ cityName }: { cityName: string }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {year} {cityName}.FYI. All rights reserved.
          </p>
          <nav aria-label="Footer navigation" className="flex items-center gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
