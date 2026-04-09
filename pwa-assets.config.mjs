export default {
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[64, 'favicon.ico']],
      padding: 0
    },
    maskable: {
      sizes: [512],
      padding: 0
    },
    apple: {
      sizes: [180],
      padding: 0
    }
  },
  images: ['public/favicon.svg']
}
