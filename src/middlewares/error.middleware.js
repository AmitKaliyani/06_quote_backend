
const errorHandler = (err,req,res,next) => {

    return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        success:false,
        message:err.message || "Internal Server error",
        errors:err.errors || [], 
        stack: process.env.NODE_ENV === "devlopment" ? err.stack : undefined

    })
}


export default errorHandler