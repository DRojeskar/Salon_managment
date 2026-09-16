import { useState } from "react";
import { chatWithGlow } from "../api/salonApi";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste! Main Glow AI hoon. Services, price, slots, bookings, offers ya AI Try-On ke baare mein poochiye." },
  ]);
  const [sending, setSending] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    setMessages((current) => [...current, { role: "user", text }]);
    setMessage("");
    setSending(true);
    try {
      const response = await chatWithGlow(text);
      setMessages((current) => [...current, { role: "assistant", text: response.data.reply || "I could not find an answer." }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error.response?.data?.message || "Glow AI is temporarily unavailable." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glow-chatbot">
      {open && (
        <section className="glow-chat-panel" aria-label="Glow AI chatbot">
          <div className="glow-chat-header">
            <div>
              <strong>Glow AI ✨</strong>
              <span>Salon assistant</span>
            </div>
            <button className="glow-chat-close" type="button" onClick={() => setOpen(false)} aria-label="Close Glow AI">×</button>
          </div>
          <div className="glow-chat-messages">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`glow-chat-message ${item.role}`}>
                {item.text}
              </div>
            ))}
            {sending && <div className="glow-chat-message assistant">Glow AI is thinking...</div>}
          </div>
          <div className="glow-chat-suggestions">
            {["Available services batao", "Meri bookings dikhao", "Aaj ke slots?", "AI Try-On kaise karein?"].map((prompt) => <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>)}
          </div>
          <form className="glow-chat-form" onSubmit={sendMessage}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Try: kal 11 baje Beard Trim book karo" aria-label="Message Glow AI" />
            <button type="submit" disabled={sending}>Send</button>
          </form>
        </section>
      )}
      <button className="glow-chat-launcher" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        Glow AI ✨
      </button>
    </div>
  );
}

export default Chatbot;
