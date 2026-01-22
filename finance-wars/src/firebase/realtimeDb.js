import { ref, set, get, child } from "firebase/database";
import { db } from "./firebase";

// Save user data
export const saveUserData = async (userId, data) => {
  await set(ref(db, "users/" + userId), data);
};

// Load user data
export const loadUserData = async (userId) => {
  const snapshot = await get(child(ref(db), "users/" + userId));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
};
