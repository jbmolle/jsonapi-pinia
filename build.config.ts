import { defineBuildConfig, BuildEntry } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    // CJS
    {
      input: 'src/',
      outDir: 'dist',
      format: 'cjs',
      ext: 'cjs'
    },
    // ESM
    {
      input: 'src/',
      outDir: 'dist'
    }
  ]
})
