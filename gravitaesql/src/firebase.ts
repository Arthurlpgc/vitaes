import * as admin from 'firebase-admin'

admin.initializeApp({
  credential: admin.credential.cert(require("../service-account-file.json")),
  databaseURL: 'https://vitaes-57424.firebaseio.com/',
})

export default admin
