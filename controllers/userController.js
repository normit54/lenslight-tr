import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Photo from "../models/photoModel.js";

    const createUser = async (req,res) => {
        try {
            const user = await User.create(req.body);
            //res.redirect("/login");  hataya sebep oluyor
            res.status(201).json({user: user._id});
            //res.status(201).json({succeded: true,user});
        } catch(error) {
            console.log("ERROR",error);    
            let errors2 = {}
            if (error.code === 11000) {
                errors2.email = "The email is already registered!!!";
            }    
            if (error.name === "ValidationError") {
                Object.keys(error.errors).forEach((key) => {
                    errors2[key] = error.errors[key].message;
                });
            }
         console.log("Errors2::::",errors2);
         // res.status(500).json({  // succeded: false, // error,   // });
         res.status(400).json(errors2);
        }
    };
    const loginUser = async (req,res) => {
        try {
            const {userName, password} = req.body;
            //console.log("req.body ", req.body )
            const user = await User.findOne({userName})
            let same = false
            if(user){
                same = await bcrypt.compare(password,user.password)
                //console.log("same ", same )
            }else {
                return res.status(401).json({
                    succeded: false,
                    error: "there is no such user",
                });
                }
            if (same) {
                   const token =  createToken(user._id);
                   res.cookie("jwt", token,{
                       httpOnly: true,
                       maxAge: 1000*60*60*24, //authmiddleware i duzeltelim
                   });
            //res.status(200).send("you are logged in");
            //       res.status(200).json({  user,
            // //token:createToken(user._id)  cookie de token olusturunca gerek kalmadı
            //       })
                    res.redirect("/users/dashboard");
                }else {
                res.status(401).json({
                    succeded: false,
                    error: "password are not matched",
                        });
                     }
        }catch(error) {
            res.status(500).json({
                succeded: false,
                error: "deneme",
            });
            }
    };
const createToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
// const getDashboardPage = (req,res) => {
//     res.render("dashboard",{ // link: "dashboard",  //     });  // };
const getDashboardPage = async (req,res) => {
    const photos = await Photo.find({user: res.locals.user._id});
    const user = await (await User.findById({_id: res.locals.user._id})).populate([
        "followers",
        "followings"
    ]);

    res.render("dashboard", {
        link: "dashboard",
        photos,
        user,
    });
};

   //butun kullanıcı kayıtlarını listeletecegiz
   const getAllUsers = async (req,res) => {
    try {
        //login olan kullanıcı da listeleniyor
        //bunu istemezsek filtre yapacagız
        //const users = await User.find({});
        const users = await User.find({_id: {$ne : res.locals.user._id}});
        
         res.status(200).render("users",{
            users,
            link: "users",
        });
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

const getAUser = async (req,res) => {
    try {
        const user = await User.findById({_id: req.params.id})

        const inFollowers = user.followers.some((follower) => {
            return follower.equals(res.locals.user._id)
        });

        const photos = await Photo.find({ user :  user._id})
        res.status(200).render("user",{
            user,
            photos,
            link: "users",
            inFollowers,
        });
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

const follow = async (req, res) => {

    // res.locals.user._id  - login yapan kullanıcı
    try {
        let user = await User.findByIdAndUpdate(
             { _id: req.params.id},
            {
                $push : { followers: res.locals.user._id },
            },
            {new: true},
        );
        
        user = await User.findByIdAndUpdate(
            { _id: res.locals.user._id },
            {
                $push : {followings: req.params.id},
            },
            {new: true},
        );
            // json bilgileri gormek istemiyoruz sayfaya yonlendirme yapacagiz
            // res.status(200).json({succeded: true, user,         });
            res.status(200).redirect(`/users/${req.params.id}`);

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
            });
        }
};

const unFollow = async (req, res) => {

    try {
        let user = await User.findByIdAndUpdate(
             { _id: req.params.id},
            {
                $pull : { followers: res.locals.user._id },
            },
            {new: true},
        );
        
        user = await User.findByIdAndUpdate(
            { _id: res.locals.user._id },
            {
                $pull : {followings: req.params.id},
            },
            {new: true},
        );
    
            // res.status(200).json({
            //     succeded: true,
            //     user,
            // });`
            res.status(200).redirect(`/users/${req.params.id}`);

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
            });
        }
};

export 
{
    createUser, 
    loginUser, 
    getDashboardPage, 
    getAllUsers, 
    getAUser, 
    follow, 
    unFollow
};