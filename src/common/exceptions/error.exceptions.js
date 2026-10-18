export const applicationExeption =({
    Message='error',
  options={
    cause:{status:400}
  }}  ={}) =>{
    throw new Error(Message,options)
}
export const conflictExeption=( Message='conflict',isses={})=>{
  return applicationExeption ({
Message,
options:{
    cause:{status:409 ,...isses}
}
  }) 
}
export const NotfoundExeption=( Message='Notfound',isses={})=>{
  return applicationExeption ({
Message,
options:{
    cause:{status:404 ,...isses}
}
  }) 
}
export const unauthorizedExeption=( Message='unauthorized',isses={})=>{
  return applicationExeption ({
Message,
options:{
    cause:{status:401 ,...isses}
}
  }) 
}
  export const BadRequestExeption=( Message='BadRequestExeption',isses={})=>{
  return applicationExeption ({
Message,
options:{
    cause:{status:400 ,...isses}
}
  }) 
}
export const forbiddenExeption=( Message='forbiddenExeption',isses={})=>{
  return applicationExeption ({
Message,
options:{
    cause:{status:403 ,...isses}
}
  }) 
}
