// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDt28Udq4_VawqgWagZk1WyV2UT2qgnL-4",
  authDomain: "projectsbyanant.firebaseapp.com",
  projectId: "projectsbyanant",
  storageBucket: "ProjectsByAnant.appspot.com",
  messagingSenderId: "583507320794",
  appId: "1:583507320794:web:a8d570d162c8164a6aeae3",
  measurementId: "G-5ZLFV3TRB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseDb=getFirestore(app);

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
export const GeminiAiModel = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });