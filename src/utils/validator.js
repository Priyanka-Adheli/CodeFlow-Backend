const validator = require('validator');

const validate = (data)=>{

    const mandortyField = ['firstName','email','password'];

    const IsAllowed = mandortyField.every((key)=> Object.keys(data).includes(key));

    if(!IsAllowed)
        throw new Error("Field Missing");

    if(!validator.isEmail(data.email))
        throw new Error("Invalid Email Format");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");

    if(data.firstName.length<=2)
        throw new Error("FirstName should of atleast 3 charaters");
}

module.exports = validate;