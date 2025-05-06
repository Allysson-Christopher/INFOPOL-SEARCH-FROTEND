import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeB3uf3-mjvcdiqkYAK_D09Biv8YGj7uA",
  authDomain: "infopol-search.firebaseapp.com",
  projectId: "infopol-search",
  storageBucket: "infopol-search.appspot.com",
  messagingSenderId: "290073136353",
 appId: "1:290073136353:web:d26a7c48cb3bd5cfb7bba0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
