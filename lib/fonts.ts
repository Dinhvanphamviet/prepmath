// Font configuration for custom fonts
// Place your SVN-Retron2000.ttf file in public/fonts/ directory

import localFont from 'next/font/local'

export const retronFont = localFont({
    src: '../public/fonts/SVN-Retron2000.ttf',
    variable: '--font-game',
    display: 'swap',
})
