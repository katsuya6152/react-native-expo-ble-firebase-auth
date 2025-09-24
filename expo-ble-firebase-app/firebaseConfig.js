// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
	apiKey: "AIzaSyDzt81YNLO9fqKTAIHwUV6TziVXuZ3ybNg",
	authDomain: "expo-ble-firebase-app.firebaseapp.com",
	projectId: "expo-ble-firebase-app",
	storageBucket: "expo-ble-firebase-app.firebasestorage.app",
	messagingSenderId: "451722007864",
	appId: "1:451722007864:web:17090c97f94aec020f5dcd",
};

export const FirebaseApp = initializeApp(firebaseConfig);
export const FirebaseAuth = initializeAuth(FirebaseApp, {
	persistence: getReactNativePersistence(AsyncStorage),
});
