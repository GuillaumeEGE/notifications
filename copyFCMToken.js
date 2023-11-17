exports.copyFCMToken = functions.firestore
    .document("users/{userId}/fcm_tokens/{tokenId}")
    .onCreate((snapshot, context) => {
      // Get the data from the newly created document
      const data = snapshot.data();

      // Set the data in the 'my_fcm_tokens' subcollection
      return admin.firestore()
          .doc(`users/${context.params.userId}/my_fcm_tokens/
          ${context.params.tokenId}`).set(data);
    });
