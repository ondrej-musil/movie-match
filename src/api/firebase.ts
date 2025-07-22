import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAE9YQvlJIA5-7RKhLqwcampEPqy71Vg6A",
  authDomain: "moviematch-c0e03.firebaseapp.com",
  projectId: "moviematch-c0e03",
  storageBucket: "moviematch-c0e03.firebasestorage.app",
  messagingSenderId: "917402468169",
  appId: "1:917402468169:web:703221f358423791c22498"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 