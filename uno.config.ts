import {
  defineConfig,
  presetIcons, presetTypography, presetUno,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  include: [/\.vue$/, /\.vue\?vue/, /\.[jt]sx?$/, /.html$/],
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetTypography(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  transformers: [transformerDirectives()],
  shortcuts: [
    {
      f: 'flex',
      fc: 'flex flex-col',
      fw: 'flex flex-wrap',
      fa: 'flex-auto',
      f1: 'flex-1',
      fs0: 'flex-shrink-0',
      fg0: 'flex-grow-0',
      fn: 'flex-none',

      js: 'justify-start',
      jc: 'justify-center',
      je: 'justify-end',
      ja: 'justify-around',
      jb: 'justify-between',
      jv: 'justify-evenly',

      jis: 'justify-items-start',
      jic: 'justify-items-center',
      jie: 'justify-items-end',
      jit: 'justify-items-stretch',

      jsa: 'justify-self-auto',
      jss: 'justify-self-start',
      jsc: 'justify-self-center',
      jse: 'justify-self-end',
      jst: 'justify-self-stretch',

      is: 'items-start',
      ic: 'items-center',
      ie: 'items-end',
      ib: 'items-baseline',
      it: 'items-stretch',

      ss: 'self-start',
      sc: 'self-center',
      se: 'self-end',
      sa: 'self-auto',
      st: 'self-stretch',

      cs: 'content-start',
      cc: 'content-center',
      ce: 'content-end',
      cb: 'content-between',
      ca: 'content-around',
      cv: 'content-evenly',

      g: 'grid',

      pcs: 'place-content-start',
      pcc: 'place-content-center',
      pce: 'place-content-end',
      pct: 'place-content-stretch',
      pcb: 'place-content-between',
      pca: 'place-content-around',
      pcv: 'place-content-evenly',

      pis: 'place-items-start',
      pic: 'place-items-center',
      pie: 'place-items-end',
      pit: 'place-items-stretch',

      re: 'relative',
      ab: 'absolute',
      ab0: 'absolute inset-0',
    },

    [/^l-(.*)$/, ([, s]) => `left-${s}`, {}],
    [/^r-(.*)$/, ([, s]) => `right-${s}`],
    [/^t-(.*)$/, ([, s]) => `top-${s}`],
    [/^b-(.*)$/, ([, s]) => `bottom-${s}`],

    [/^rd-(.*)$/, ([, s]) => `rounded-${s}`],
    [/^bd-(.*)$/, ([, s]) => `border-${s}`],
    [/^ri-(.*)$/, ([, s]) => `ring-${s}`],
    [/^tx-(.*)$/, ([, s]) => `text-${s}`],
    [/^dv-(.*)$/, ([, s]) => `divide-${s}`],
    [/^sd-(.*)$/, ([, s]) => `shadow-${s}`],
  ],
  theme: {
    breakpoints: {
      'sm': '576px',
      'md': '720px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1400px',
      '3xl': '1540px',
      '4xl': '1860px',
      '5xl': '2480px',
    },
  },
})
