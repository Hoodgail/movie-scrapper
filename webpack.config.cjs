module.exports = {
     entry: './src/main.js',
     output: {
          path: __dirname + '/public/dist',
          filename: 'bundle.js'
     },
     resolve: {
          alias: { 'module': __dirname + "/node_modules" }
     },
     module: {
          rules: [{
               test: /\.css$/i,
               use: ["style-loader", "css-loader"],
          }, {
               test: /\.(txt|svg)$/i,
               use: 'raw-loader',
          }, {
               test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
               use: [{
                    loader: 'file-loader',
                    options: {
                         name: '[name].[ext]',
                         outputPath: 'fonts/'
                    }
               }],
          }],


     }, target: "web"
}