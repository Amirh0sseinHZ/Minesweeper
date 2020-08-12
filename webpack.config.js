const path = require("path");

module.exports = {
  entry: "./src/js/index.js",
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["@babel/preset-env"],
          plugins: ["transform-class-properties"],
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "url-loader",
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "src/js"),
    filename: "script.bundle.js",
  },
};
