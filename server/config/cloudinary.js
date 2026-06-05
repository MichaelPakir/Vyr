import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
)

dotenv.config({ path: envPath })

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables")
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

export default cloudinary
