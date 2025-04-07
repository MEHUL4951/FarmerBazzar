
import dotenv from 'dotenv'
import { initializeApp } from "firebase-admin/app";
dotenv.config()

const connectDB = async ()=>{
      //   try{
      //         const DB_OPTIONS = {
      //               dbName : "Farmer_Bazzar"
      //         }
      //         const conn = await mongoose.connect(process.env.DATABASE_URL,DB_OPTIONS)
      //         console.log("Connect to MongoDb succesfully")
      //   }catch(err){
      //         console.log(`${err.message}`)
      //   }

      try{
           
            const auth = getAuth(firebaseApp);
            return auth
      }catch(err){
            console.log(`${err.message}`)
      }
}

export default connectDB