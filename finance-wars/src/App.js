import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Game from "./pages/Game/Game";
import Auth from "./pages/Auth/Auth";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import News from "./pages/News/News";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import Quiz from "./pages/Quiz/Quiz";

function App() {
  const [page, setPage] = useState("auth");

  return (
    <>
      {page !== "auth" && (
        <Navbar onNavigate={setPage} />
      )}

      {page === "auth" && (
        <Auth onAuthSuccess={() => setPage("home")} />
      )}

      {page === "home" && (
        <Home
          startGame={() => setPage("game")}
          openHowItWorks={() => setPage("howItWorks")}
        />
      )}

      {page === "game" && <Game />}

      {page === "leaderboard" && <Leaderboard />}

      {page === "news" && <News />}

      {page === "howItWorks" && <HowItWorks />}

      {page === "quiz" && <Quiz />}

    </>
  );
}

export default App;
