import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'

const pkg = require('./package.json')

const replaceOption = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
}

export default {
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'umd', name: 'zoro', exports: 'named' },
    { file: pkg.module, format: 'es', exports: 'named' },
  ],
  plugins: [
    nodeResolve({
      jsnext: true,
    }),
    babel(),
    replace(replaceOption),
    commonjs(),
  ],
}
