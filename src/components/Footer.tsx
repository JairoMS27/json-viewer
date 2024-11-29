import Link from 'next/link'
import { translations } from '@/translations'

interface FooterProps {
  language: string;
}

export default function Footer({ language }: FooterProps) {
  const t = translations[language as keyof typeof translations]

  return (
    <footer className="mt-8 text-center text-sm text-gray-500">
      <p>
        {t.footer.built} ❤️ {t.footer.by}{' '}
        <Link href="https://github.com/JairoMS27" className="font-medium hover:underline">
          @JairoMS27
        </Link>
      </p>
      <p className="mt-1">
        {t.footer.poweredBy}{' '}
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