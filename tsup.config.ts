import { defineConfig } from 'tsup'
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'es2017',
  sourcemap: true,
  clean: true,
  esbuildPlugins: [TsconfigPathsPlugin({ tsconfig: 'tsconfig.json' })],
  esbuildOptions(options) {
    options.loader = {
      ...(options.loader || {}),
      '.json': 'json',
    }
  },
})
