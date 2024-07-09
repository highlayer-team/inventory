// https://nuxt.com/docs/api/configuration/nuxt-config
import commonjs from 'vite-plugin-commonjs'
import {nodePolyfills} from 'vite-plugin-node-polyfills'
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr:false,
  modules: ["@nuxtjs/tailwindcss","shadcn-nuxt", "@pinia/nuxt"],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
     plugins: [
        commonjs(),
        nodePolyfills({
          protocolImports: true,
          globals: {
            Buffer: true, // can also be 'build', 'dev', or false
            global: true,
          },
        }),
        wasm(),
        topLevelAwait()
      ],
      optimizeDeps: {
        include: ['ecpair', 'bitcoinjs-lib', 'tiny-secp256k1'] // Example of a CJS module to optimize
      },
      resolve: {
        alias: {
          buffer: 'buffer'
        }
      }
    },
    
  css: ['~/assets/css/global.css'],
})
