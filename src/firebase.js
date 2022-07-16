// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: process.env.CHAT_APP_API_KEY,
  // authDomain: process.env.CHAT_APP_AUTH_DOMAIN,
  // databaseURL: process.env.CHAT_APP_DATABASE_URL,
  // projectId: process.env.CHAT_APP_PROJECT_ID,
  // storageBucket: process.env.CHAT_APP_STORAGE_BUCKET,
  // messagingSenderId: process.env.CHAT_APP_MESSAGING_SENDER_ID,
  // appId: process.env.CHAT_APP_APP_ID,
  apiKey: "AIzaSyAogTG9xUAMabkALehgsHuC6xyhMPSVwbs",
  authDomain: "chat-app-b77dd.firebaseapp.com",
  databaseURL: "http://chat-app-b77dd.firebaseio.com",
  projectId: "chat-app-b77dd",
  storageBucket: "chat-app-b77dd.appspot.com",
  messagingSenderId: "119817008547",
  appId: "1:119817008547:web:1fafc5bc414da10c031616",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { auth, db, storage, provider };
