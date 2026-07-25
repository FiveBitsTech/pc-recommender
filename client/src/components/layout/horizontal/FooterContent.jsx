'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()}, Cotiza - IA `}</span>
        <span>🚀</span>
        <span>{` por `}</span>
        <Link href='/about' className='text-primary'>
          Equipo #50
        </Link>
      </p>
      <div className='flex items-center gap-4'>
        <Link href='https://discord.gg/FzcheVnU' target='_blank' rel='noreferrer' className='text-primary'>
          Discord
        </Link>
        <Link href='https://wa.me/51923675790' target='_blank' rel='noreferrer' className='text-primary'>
          Contacto
        </Link>
      </div>
    </div>
  )
}

export default FooterContent
