const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.subscribeToTopic = functions.https.onRequest(async (req, res) => {
  try {
    const {token, topic} = req.body;
    console.log("Received token:", token);
    console.log("Received topic:", topic);
    // Subscribe the device to the topic
    await admin.messaging().subscribeToTopic(token, topic);

    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    res.status(500).json({success: false, error: "Internal Server Error"});
  }
});
