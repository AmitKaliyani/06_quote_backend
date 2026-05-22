

const baseOption = {
    httpOnly: true,
    secure: true,
   
  }
export const setCookie = ({res,name,value,maxAge}) => {
      res.cookie(name, value, {...baseOption,maxAge});
}