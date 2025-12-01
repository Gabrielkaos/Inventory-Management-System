const {DataTypes} = require("sequelize")
const bcrypt = require("bcryptjs")
const {sequelize} = require("../config/database")


const User = sequelize.define('User',{
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true
    },
    username: {
        type:DataTypes.STRING(30),
        allowNull:false,
        unique:true,
        validate: {
            len:{
                args: [3,20],
                msg: 'Username must be between 3 and 30 characters'
            },
            is:{
                args:/^[a-zA-Z0-9_]+$/,
                msg: 'Username can only contain letters, numbers, and underscores'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull:false,
        unique: true,
        validate:{
            isEmail:{
                msg:'Provide a proper email'
            }
        },
        set(value){
            this.setDataValue('email',value.toLowerCase().trim())
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            len:{
                args:[8],
                msg:'Password length must be 8 characters long or greater'
            }
        }
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        field:'is_active'
    },
    lastLogin:{
        type:DataTypes.DATE,
        field:'last_login'
    }
}, {
    tableName:'users',
    underscored:true,
    timestamps:true,
    hooks: {
        beforeCreate: async (user) => {
            if(user.password){
                const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(user.password,salt)
            }
        },

        beforeUpdate: async (user) => {
            if(user.changed('password')){
                const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(user.password,salt)
            }
        }
    }
})


User.prototype.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}

User.prototype.toSafeObject = function(){
    const {password,...userWithoutPassword} = this.toJSON()
    return userWithoutPassword
}

module.exports = User