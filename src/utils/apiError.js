class apiError extends Error{
    constructor(
        statusCode,
        message="error occure",
        errors=[],
    
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors
    }
}

export {apiError}