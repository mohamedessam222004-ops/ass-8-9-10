export const globalerrorhandling =(error,req,res,next)=>{
    return res.status (error.cause?.status ?? 500).json({
        error_message :error.message || 'server error',
        isses:error.cause?.isses,
        error,
        stack:error.stack
    })
}