import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

const defaultPlugins = [
  typescript()
]

const esModuleConfig = {
  input: './lib/index.ts',
  output: {
    name: 'HMTID',
    format: 'es',
    file: './dist/index.esm.js'
  },
  plugins: [
    ...defaultPlugins,
    babel({ babelHelpers: 'bundled' })
  ]
}

const umdConfig = {
  input: './lib/index.ts',
  output: {
    name: 'HMTID',
    format: 'umd',
    file: './dist/index.umd.js'
  },
  plugins: [
    ...defaultPlugins,
    babel({ babelHelpers: 'bundled' })
  ]
}

export default [
  esModuleConfig,
  umdConfig
]
