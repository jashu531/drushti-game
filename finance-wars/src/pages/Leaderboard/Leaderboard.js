import { useEffect, useState } from "react";
import { getLeaderboard } from "../../firebase/leaderboardDb";
import "./Leaderboard.css";

function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getLeaderboard();

      const list = Object.entries(data).map(
        ([id, player]) => ({
          id,
          ...player,
        })
      );

      list.sort((a, b) => b.totalValue - a.totalValue);
      setPlayers(list);
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="leaderboard-page">
      <h1>Global Leaderboard</h1>

      {players.length === 0 ? (
        <p>No players yet</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Email</th>
              <th>Total Value (₹)</th>
              <th>Profit / Loss (₹)</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.email}</td>
                <td>{p.totalValue}</td>
                <td
                  className={
                    p.profitLoss >= 0 ? "profit" : "loss"
                  }
                >
                  {p.profitLoss}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
