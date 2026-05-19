
class ApiResponse{
    constructor(statusCode,message="success",data=null,success=true){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = success
    }
}


export default ApiResponse