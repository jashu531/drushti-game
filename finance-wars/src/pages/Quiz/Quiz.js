import { useState } from "react";
import "./Quiz.css";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);


  const fetchAIQuestions = async (level) => {
    setLoading(true);
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelected(null);

    try {
      const res = await fetch("http://localhost:5000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });

      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load quiz", err);
    }

    setLoading(false);
  };

const handleAnswer = (index) => {
  if (selected !== null) return; // 🔒 prevent double clicks

  setSelected(index);

  const correct = index === questions[currentQuestion].correct;
  setIsCorrect(correct);

  if (correct) {
    setScore((prev) => prev + 1);
  }

  setShowExplanation(true);

  setTimeout(() => {
    setShowExplanation(false);
    setIsCorrect(null);
    setSelected(null);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  }, 2000); // ⏱ 2 seconds to read explanation
};


  return (
    <div className="quiz-page">
      <h1>FinanceWar Quiz</h1>

      {!quizStarted && !loading && (
        <div className="quiz-levels">
          <button onClick={() => fetchAIQuestions("beginner")}>Beginner 🟢</button>
          <button onClick={() => fetchAIQuestions("intermediate")}>Intermediate 🟡</button>
          <button onClick={() => fetchAIQuestions("advanced")}>Advanced 🔴</button>
        </div>
      )}

      {loading && <p>Generating AI questions...</p>}

      {!loading && quizStarted && !quizFinished && questions.length > 0 && (
        <div className="quiz-content">
          <h3>
            Q{currentQuestion + 1}. {questions[currentQuestion].question}
          </h3>

          <div className="quiz-options">
            {questions[currentQuestion].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={
                  selected === i
                    ? i === questions[currentQuestion].correct
                      ? "correct"
                      : "wrong"
                    : ""
                }
              >
                {opt}
              </button>
            ))}
          </div>
          {showExplanation && (
  <div className={`quiz-explanation ${isCorrect ? "correct" : "wrong"}`}>
    <strong>
      {isCorrect ? "✅ Correct!" : "❌ Wrong"}
    </strong>
    <p>{questions[currentQuestion].explanation}</p>
  </div>
)}

        </div>
      )}

      {quizFinished && (
        <div className="quiz-result">
          <h2>🎉 Quiz Completed!</h2>
          <p>
            Your Score: <strong>{score}</strong> / {questions.length}
          </p>
          <button onClick={() => setQuizStarted(false)}>
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
