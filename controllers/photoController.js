import Photo from "../models/photoModel.js";
import { v2 as cloudinary} from "cloudinary";
import fs from "fs";  //tmp klasorunu ıptal icin kullanılacak

// const createPhoto = (req,res) => {
//     console.log("REQ BODY",req.body);
    
//     const photo = Photo.create(req.body);
//     res.status(201).json({
//         succeded: true,
//         //blogun bu halinde serverdan photo bilgisinin gelmesini bekleyemiyor
//         //o yuzden thunder da photo boş gozukuyor - sistemi asenkron hale getirecegiz
//         photo,
//     });
// };
//blogun asenkron olanını yazalım - hata bloguyla beraber

    const createPhoto = async (req,res) => {

        const result = await cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            {
                use_filename: true,
                folder: "lenslight_tr",
            }
        );

       // console.log("SONUC ",result)

        try {
            //    const photo = await Photo.create(req.body);
            await Photo.create ({
                name: req.body.name,
                description: req.body.description,
                user: res.locals.user._id,
                url: result.secure_url,
                image_id: result.public_id,
            });

            //foto upload olduktan sonra tmp dekini silecek
            
            fs.unlinkSync(req.files.image.tempFilePath);
            res.status(201).redirect("/users/dashboard");
            // res.status(201).json({ // succeded: true, // photo, // });
        } catch(error) {
            res.status(500).json({
                succeded: false,
                error:"hata yok",
            });
        }
    };

    //butun kayıtları listeletecegiz
    const getAllPhotos = async (req,res) => {
    try {
        //bu sistem login olmus kullanıcılara gore yapıldı duaeltecegiz
        //ternary operatoru ile cozum  yaptı ama is degil !!! SOLID ENGIN HOCA
        //   filtreleme ekliyoruz const photos = await Photo.find({})
        //const photos = await Photo.find({user : {$ne: res.locals.user._id}});
        const photos = res.locals.user ? await Photo.find({user : {$ne: res.locals.user_id}})
        : await Photo.find({})

         //res.status(200).json({
        //     succeded: true,
        //     photos
        // })
        //veritabanından foto cekmesine gerek kalmadi web sayfasını actiracagiz
        //res.status(200).render("photos",{photos,link: "photos"})

        res.status(200).render("photos",{
            photos,
            link: "photos",
        });
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

const getAPhoto = async (req,res) => {
    try {
        const photo = await Photo.findById({_id: req.params.id}).populate("user")

        // console.log("photo", photo);
        // console.log("res.locals.usr_id",res.locals.user._id);

        let isOwner = false
        if (res.locals.user){
            isOwner = photo.user.equals(res.locals.user._id) 
        }
        // console.log("owner", isOwner);

        res.status(200).render("photo",{
            photo,
            link: "photos",
            isOwner
        });
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

const deletePhoto = async (req,res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        
        const photoId = photo.image_id;
        
        await cloudinary.uploader.destroy(photoId);
        await Photo.findOneAndRemove({_id: req.params.id});
        
        res.status(200).redirect("/users/dashboard");
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

const updatePhoto = async (req,res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        
        if (req.files) {
        const photoId = photo.image_id;
        await cloudinary.uploader.destroy(photoId);
        
        const result = await cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            {
                use_filename: true,
                folder: "lenslight_tr",
            }
        );

            photo.url = result.secure_url
            photo.image_id = result.public_id

            fs.unlinkSync(req.files.image.tempFilePath);
            
        }
        photo.name = req.body.name;
        photo.description = req.body.description;

        photo.save();

        res.status(200).redirect(`/photos/${req.params.id}`);
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error,
        });
    }
};

export {createPhoto, getAllPhotos, getAPhoto, deletePhoto, updatePhoto};

