import { v2  as cloudinary } from "cloudinary"

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})


export async function uploadImage(file: any) {
  const cloudinaryApiResponse: any = await new Promise(function(resolve, reject) {
    cloudinary.uploader.upload_stream({folder: 'profileImage'}, function(error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    }).end(file)
  })
  return cloudinaryApiResponse.secure_url
}