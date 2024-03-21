import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import vendorRouter from './routes/vendor.route.js'
import userRouter from './routes/user.route.js'
import domainRouter from './routes/domain.route.js'
import bussinessRouter from './routes/bussiness.route.js'
import galleryRouter from './routes/gallery.route.js'
import itemRouter from './routes/items.route.js'
import bussinessActivityRouter from './routes/bussinessActivity.route.js'


//routes declaration
app.use("/api/v1/vendor", vendorRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/domain", domainRouter)
app.use("/api/v1/bussiness", bussinessRouter)
app.use("/api/v1", galleryRouter)
app.use("/api/v1", itemRouter)
app.use("/api/v1", bussinessActivityRouter)

export { app }