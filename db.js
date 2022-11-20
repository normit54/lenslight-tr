import mongoose from "mongoose";

const conn = () => {
    mongoose.connect(process.env.DB_URI,{
        dbName: "lenslight_tr",
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(()=> {
        console.log("db ye basarıyla baglanıldı");
    })
    .catch((err)=>{
        console.log("db baglanti hatası:, ${err}");
    });
};
export default conn;