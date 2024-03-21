import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
// import bcrypt from "bcrypt"

const vendorSchema = new Schema(
    {
        // username: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     lowercase: true,
        //     trim: true, 
        //     index: true
        // },

        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },

        mobile: {
            type: Number,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        gender: {
            type: String,
            enum: ["male", "female","other"],
            default: "male",
            required: true,
            trim: true,
            index: true
        },

        
        profileImage: {
            type: String, // cloudinary url
        },
        
        // parentId: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User"
        // },

        address:
        {
            city: {
                type: String,
            },
            state: {
                type: String,
              
            },
            street: {
                type: String,
              
            },
            area: {
                type: String,
            },
            pincode: {
                type: Number,
            },
            latitude: {
                type: String,
            },
            longitude: {
                type: String,
            }
        }
        ,
        otp: {
            type: Number,
            
        },

        status: {
            type: String,
            enum: ['active', 'inactive', 'block','delete'],
            default: 'active',
            index: true
        },

        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

// vendorSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     this.password = await bcrypt.hash(this.password, 10)
//     next()
// })

// vendorSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password)
// }

vendorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            mobile: this.mobile,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
vendorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Vendor = mongoose.model("Vendor", vendorSchema)