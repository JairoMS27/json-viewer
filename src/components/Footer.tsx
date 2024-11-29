import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-8 text-center text-sm text-gray-500">
      <p>
        Built by{' '}
        <Link href="https://github.com/JairoMS27" className="font-medium hover:underline">
          @JairoMS27
        </Link>
      </p>
      <p className="mt-1">
        Powered by{' '}
        <Link href="https://nextjs.org" className="font-medium hover:underline">
          Next.js
        </Link>{' '}
        and{' '}
        <Link href="https://ui.shadcn.com" className="font-medium hover:underline">
          shadcn/ui
        </Link>
      </p>
    </footer>
  )
} 