import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'

const babelOption = {
  babelrc: false,
  exclude: 'node_modules/**',
  presets: [['@babel/preset-env', { modules: false, loose: true }]],
}

const replaceOption = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.CODE': JSON.stringify('var regeneratorRuntime=runtime;'),
}

export default [
  {
    input: 'src/weapp-zoro.js',
    output: {
      format: 'es',
      indent: false,
      file: 'dist/zoro.js',
      exports: 'named',
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      babel(babelOption),
      replace(replaceOption),
      commonjs(),
    ],
  },
  {
    input: 'src/weapp-redux.js',
    output: {
      format: 'es',
      indent: false,
      file: 'dist/weapp-redux.js',
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      babel(babelOption),
      replace(replaceOption),
      commonjs(),
    ],
  },
]
