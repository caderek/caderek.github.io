import imagemin from "imagemin"
import imageminJpegtran from "imagemin-jpegtran"
import imageminPngquant from "imagemin-pngquant"

const compressImage = async (input) => {
  const destination = "docs/images"

  await imagemin([input], {
    destination,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  })

  return destination
}

export default compressImage
