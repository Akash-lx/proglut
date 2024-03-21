class ApiError {
    constructor(statusCode, message = "Something went wrong",error=[]){
        this.statusCode = statusCode
        this.message = message
        this.data = []
        this.success = false
        this.error = error
    }
}

export { ApiError }


// class ApiError extends Error {
//     constructor(
//         statusCode,
//         message= "Something went wrong",
//         errors = [],
//         stack = ""
//     ){
//         super(message)
//         this.statusCode = statusCode
//         this.data = []
//         this.message = message
//         this.success = false;
//         this.errors = errors

//         if (stack) {
//             this.stack = stack
//         } else{
//             Error.captureStackTrace(this, this.constructor)
//         }

//     }
// }

// export {ApiError}