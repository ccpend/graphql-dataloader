module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "targets": {
          "node": true
        }
      }
    ]
  ],
  "env": {
    "test": {
      "plugins": [
        "@babel/plugin-transform-modules-commonjs"
      ]
    }
  },
  "plugins": [
    "@babel/plugin-proposal-class-properties",
  ]
}
