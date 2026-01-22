import { ref, set, get } from "firebase/database";
import { db } from "./firebase";

// Save or update leaderboard entry
export const updateLeaderboard = async (
  userId,
  email,
  totalValue,
  profitLoss
) => {
  await set(ref(db, "leaderboard/" + userId), {
    email,
    totalValue,
    profitLoss,
  });
};

// Fetch leaderboard data
export const getLeaderboard = async () => {
  const snapshot = await get(ref(db, "leaderboard"));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};
