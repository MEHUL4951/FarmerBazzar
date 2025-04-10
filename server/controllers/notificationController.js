import admin from '../firebase.js'
const db = admin.firestore()

class Notification{
     static NotifyAllUsersAboutNews = async (req, res) => {
          const { news } = req.body;
      
          try {
              const userSnapshot = await db.collection("users").get();
              
              if (userSnapshot.empty) {
                  res.status(404).send("Users Not Found");
                  return;
              }
      
              const notifications = [];
              userSnapshot.forEach(doc => {
                  notifications.push({
                      from: 'System',          // The 'from' field is set to 'System' as the news is coming from the system
                      to: doc.id,             // The 'to' field is the user's ID
                      type: 'news',           // The type of notification is 'news'
                      timestamp: Date.now(),   // The timestamp of the notification
                      message : `${news}`   //Message of the Notification
                    });
              });
      
              const batch = db.batch();
              notifications.forEach(notification => {
                  const docRef = db.collection('notifications').doc(); // Create a new document with a unique ID
                  batch.set(docRef, notification);
              });
      
              await batch.commit();
              res.status(201).send('All users are notified about the news');
              
          } catch (error) {
              res.status(500).send('Error notifying users: ' + error.message);
          }
      }
      
     static NotifyUserAboutNewProducts = async (req, res) => {
          const { userId,productName} = req.body;
          try {
              const userSnapshot = await db.collection('users').get();
              
              if (userSnapshot.empty) {
                  res.status(404).send("Users Not Found");
                  return;
              }
      
              let notifications = [];
              userSnapshot.forEach(doc => {
                  if (doc.id !== userId) { // Use doc.id to get the document ID (which is the user ID in this case)
                      notifications.push({
                          from: userId,            // The user who added the product
                          to: doc.id,              // The user who will receive the notification
                          type: 'product',         // Type of the notification
                          timestamp: Date.now(),    // Timestamp of the notification
                          message : `${userId} added Product ${productName}` // Messge for the Notification
                     });
                  }
              });
      
              const batch = db.batch();
              notifications.forEach(notification => {
                  const docRef = db.collection('notifications').doc(); // Create a new document with a unique ID
                  batch.set(docRef, notification);
              });
      
              await batch.commit();
              res.status(201).send('Users notified about the new product');
          } catch (error) {
              res.status(500).send('Error Notifying users: ' + error.message);
          }
      }
      
      static markAllasRead = async (req,res)=>{
             const {userId} = req.params
             try{
               // Find All the Notification from the User
               const userNotificationSnapshot =await db.collection("notifications")
                                                .where('to','==',userId)
                                                .get()
                if(userNotificationSnapshot.empty){
                       res.status(404).send("No Notification Found for the User")
                       return
                }
                // Create Batch to handle multiple operation in Single Unit
              const batch = db.batch()
              userNotificationSnapshot.forEach(doc=>{
                      batch.delete(doc.ref)
                })
                await batch.commit()
                res.status(200).send("All Notifications for the user have been marked as read")
             }catch(err){
                  res.status(500).send("Error marking Notification as Read" + err.message)
             }

      }

      static deleteSingleNotification = async (req,res)=>{
               const {notificationId} = req.params
               try{
                    const notification = db.collection("notifications").doc(notificationId)
                    const docSnapshot = await notification.get()

                    if(!docSnapshot.exists){
                           res.status(404).send("Notification not Found")
                           return 
                    }
                    await notification.delete()
                    res.status(200).send("Notification Deleted Successfully")
                                         
               }
               catch(err){
                  res.status(500).send("Error Deleleting Notification " + err.message)
               }

      }
      static getAllNotifications = async (req,res)=>{
               try{
                  const notificationSnapshot = db.collection('notifications').get()
               
                if(notificationSnapshot.empty){
                     res.status(404).send("No Notification Found")
                     return 
                }
                const notification = (await notificationSnapshot).docs.map(doc=>({
                       id:doc.id,
                       ...doc.data()
                }))
                res.status(200).send(notification)
               }catch(err){
                 res.status(500).send("Error Fetching Notification "+err.message)
               }
      }

      static async sendTestNotification(req, res) {
        try {
          const { fcmToken } = req.body;
      
          if (!fcmToken) {
            return res.status(400).json({ error: 'FCM token is required' });
          }
      
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: '🔔 Test Notification',
              body: 'This is a test notification from the backend.',
            },
            data: {
              type: 'test',
              testId: '123',
            },
          });
      
          return res.status(200).json({ message: 'Test notification sent successfully' });
        } catch (error) {
          console.error('sendTestNotification error:', error);
          return res.status(500).json({ error: 'Failed to send notification' });
        }
      }
      
}
export default Notification
