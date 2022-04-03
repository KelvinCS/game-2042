const path = require("path")
const fs = require("fs")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const appDirectory = fs.realpathSync(process.cwd())

const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);
const host = 'localhost'
process.env.NODE_ENV = 'development'


module.exports = {
  mode: "development",
  entry: resolveAppPath('src'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  devServer: {
    compress: true,
    hot: true,
    host,
    port: 3000,
  }
}
