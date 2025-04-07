// import admin from '../firebase.js'
// const db = admin.firestore();

// const userCollection = db.collection("users")
//  const createUser = async (userData)=>{
//            try{
//             const {uid,firstName,lastName,email,phoneNumber, state} = userData
//               await userCollection.doc(uid).set({
//                    firstName,
//                    lastName,
//                    email,
//                    phoneNumber,
//                    state,
//                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
//                 });
//                 return {success : true};
//            }
//            catch(error){
//               console.log("Error Creating user:",error);
//               return {success:false,error};
//            }
//       }

      
//       const getUserByUID = async (uid) => {
//         try {
//           const usersCollection = admin.firestore().collection('users'); // Make sure 'users' is your collection name
//           const userDoc = await usersCollection.doc(uid).get();
      
//           if (!userDoc.exists) {
//             return null; // User not found
//           }
      
//           return userDoc.data(); // Return user data
//         } catch (error) {
//           console.error("Error fetching user:", error.message);
//           throw new Error('Failed to fetch user from Firestore');
//         }
//       }

//       const getAllUsers = async () => {
//         try {
//             const usersCollection = admin.firestore().collection('users'); // Make sure 'users' is your collection name
//             const snapshot = await usersCollection.get(); // Get all documents from 'users' collection
    
//             if (snapshot.empty) {
//                 return []; // No users found
//             }
    
//             const users = snapshot.docs.map(doc => {
//                 return { uid: doc.id, ...doc.data() }; // Include user ID and data
//             });
  
//             return users;
//         } catch (error) {
//             console.error("Error fetching users:", error.message);
//             throw new Error('Failed to fetch users from Firestore');
//         }
//     }
    

// export {createUser,getUserByUID,getAllUsers}


import admin from '../firebase.js';
const db = admin.firestore()

class UserModel {
  constructor(uid, firstName, lastName, email, phoneNumber, state) {
    this.uid = uid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.state = state;
    this.userCollection = db.collection("users");
  }

  async createUser() {
    try {
      const userData = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        state: this.state,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
  
      await this.userCollection.doc(this.uid).set(userData);
  
      // Return the user data along with success status
      return {
        success: true,
        user: {
          uid: this.uid,
          ...userData,
          createdAt: new Date().toISOString(), // Optional: Convert server timestamp to ISO string
        },
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error };
    }
  }
  
  static async getUserByUID(uid) {
    try {
      const userCollection = admin.firestore().collection("users");
      const userDoc = await userCollection.doc(uid).get();
      if (!userDoc.exists) {
        return null; // User not found
      }
      const userData = userDoc.data();
      return { uid, ...userData };  // Return user data
    } catch (error) {
      console.error("Error fetching user:", error.message);
      throw new Error('Failed to fetch user from Firestore');
    }
  }

  static async getAllUsers() {
    try {
      const userCollection = admin.firestore().collection("users");
      const snapshot = await userCollection.get();
      if (snapshot.empty) {
        return []; // No users found
      }
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching users:", error.message);
      throw new Error('Failed to fetch users from Firestore');
    }
  }

  static async updateUserByUID(uid, updatedData) {
    try {
      const userCollection = admin.firestore().collection("users");
      const userDoc = userCollection.doc(uid);
  
      const docSnapshot = await userDoc.get();
      if (!docSnapshot.exists) {
        throw new Error("User not found");
      }
  
      await userDoc.update(updatedData); // Update user data
      return { success: true, message: "User updated successfully" };
    } catch (error) {
      console.error("Error updating user:", error.message);
      throw new Error("Failed to update user in Firestore");
    }
  }

}

export default UserModel;

