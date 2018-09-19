import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: "src/client.js",
    output: {
        file: "public/dist/game.js",
        format: "iife",
        sourcemap: true
    },
    plugins: [
        // resolve node modules
        resolve(),
        // load cjs
        commonjs(),
        // uglify
        //terser()
    ]
};   
