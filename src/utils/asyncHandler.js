import { ApiError } from "./ApiError.js"

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err)
           res.status(err?.code || 500)
            .json(new ApiError(err?.code || 500,err.message))
        } )
    }
}


export { asyncHandler }

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }