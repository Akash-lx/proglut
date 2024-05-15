import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
// import dotenv from "dotenv"
// dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    // origin: ["https://admin.proglut.com"],
    // methods:["GET","POST","PUT","PATCH","DELETE"],
    // allowedHeaders:["Content-Type", "Authorization"],
    credentials: true
}))

app.use(express.json({ limit: "50MB" }))
// app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: '50MB', parameterLimit: 100000, fieldSize: 10000000 }));
app.use(express.static("public"))
app.use(cookieParser())



//routes import
import vendorRouter from './routes/vendor.route.js'
import domainRouter from './routes/domain.route.js'
import bussinessRouter from './routes/bussiness.route.js'
import eventRouter from './routes/event.route.js'
// import galleryRouter from './routes/gallery.route.js'
import itemRouter from './routes/items.route.js'
import bussinessActivityRouter from './routes/bussinessActivity.route.js'
import masterRoute from './routes/master.route.js'
import bookingRoute from './routes/booking.route.js'
import reportRoute from './routes/report.route.js'


//routes declaration

// app.get('/',(req,res) =>{
//     res.send('Welcome to Progult');
// })

app.use("/api/v1", vendorRouter)
app.use("/api/v1/domain", domainRouter)
app.use("/api/v1/bussiness", bussinessRouter)
app.use("/api/v1/event", eventRouter)
app.use("/api/v1/booking", bookingRoute)
app.use("/api/v1", itemRouter)
app.use("/api/v1", bussinessActivityRouter)
app.use("/api/v1/master", masterRoute)
app.use("/api/v1/report", reportRoute)

export { app }