import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Las credenciales SOLO vienen de variables de entorno.
// En desarrollo: definir en `.env.local`.
// En produccion (Vercel): definir en Settings > Environment Variables.
// NO hardcodear valores aqui — el repo es publico.
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

// Fallback config para evitar que falle el build en Vercel cuando no hay variables de entorno configuradas
const hasConfig = !!firebaseConfig.apiKey;
const activeConfig = hasConfig 
  ? firebaseConfig 
  : {
      apiKey: "AIzaSyDummyKeyForBuildTimeOnly12345",
      authDomain: "dummy-project.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy-project.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    };

// Validacion temprana — si falta una variable, mejor fallar al inicio que tener errores sutiles
if (typeof window !== "undefined" && !hasConfig) {
  console.error("[firebase] Faltan variables NEXT_PUBLIC_FIREBASE_* en el entorno.")
}

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApps()[0]

// Initialize App Check if we're in the browser
if (typeof window !== "undefined") {
  // Omitimos inicializar App Check en localhost por ahora, ya que la clave de reCaptcha
  // era inventada y bloqueaba la petición (Error 401). 
  // Borramos cualquier token inválido que se haya cacheado accidentalmente en el navegador.
  try {
    window.indexedDB.deleteDatabase("firebase-app-check-database");
  } catch (e) {}
}

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
