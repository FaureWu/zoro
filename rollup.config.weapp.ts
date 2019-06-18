import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

const replaceOption = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
}

export default [
  {
    input: 'src/weapp-zoro.js',
    output: {
      format: 'es',
      indent: false,
      file: 'dist/zoro.weapp.js',
      exports: 'named',
    },
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main', 'jsnext'],
      }),
      typescript(),
      replace(replaceOption),
      commonjs(),
    ],
  },
  {
    input: 'src/weapp-redux.js',
    output: {
      format: 'es',
      indent: false,
      file: 'dist/redux.weapp.js',
    },
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main', 'jsnext'],
      }),
      typescript(),
      replace(replaceOption),
      commonjs(),
    ],
  },
]
