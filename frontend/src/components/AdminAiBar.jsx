import { useState } from "react";
import { chatWithGlow } from "../api/salonApi";

function AdminAiBar() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (event) => {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      const response = await chatWithGlow(query.trim());
      setAnswer(response.data.reply || "No answer found.");
    } catch (error) {
      setAnswer(error.response?.data?.message || "Glow AI is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-ai-bar">
      <form onSubmit={ask}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask Glow AI: Is month ka profit kitna hai?" aria-label="Ask Glow AI" />
        <button type="submit" disabled={loading}>{loading ? "..." : "Ask"}</button>
      </form>
      {answer && <p>{answer}</p>}
    </div>
  );
}

export default AdminAiBar;
