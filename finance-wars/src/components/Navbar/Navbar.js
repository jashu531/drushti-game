import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import "./Navbar.css";

function Navbar({ onNavigate }) {
  const handleLogout = async () => {
    await signOut(auth);
    onNavigate("auth");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">↗ FINANCEWAR</span>
      </div>

      <ul className="navbar-center">
        <li onClick={() => onNavigate("home")}>Home</li>
        <li onClick={() => onNavigate("game")}>Play Game</li>
        <li onClick={() => onNavigate("leaderboard")}>Leaderboard</li>
        <li onClick={() => onNavigate("news")}>News</li>
        <li onClick={() => onNavigate("quiz")}>🧠 Quiz</li>
      </ul>

      <div className="navbar-right">
        <button className="login-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
