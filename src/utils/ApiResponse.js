
class ApiResponse{
    constructor(statusCode,message="success",data=null,success=true,meta=null){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = success

        if(meta){
            this.meta = meta
        }
    }
}


export default ApiResponse