//src\components\compCommissionForm.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type Topic = {
  id: number;
  name: string;
};

export function CompCommissionForm() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase.from("topics").select("*").order("name");
      if (error) {
        console.error(error);
      } else {
        setTopics(data || []);
      }
    };
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId || !message.trim()) {
      setError("Выберите тему и введите сообщение");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Вы должны быть авторизованы");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("commissions")
      .insert([{ user_id: user.id, topic_id: topicId, message }]);

    setLoading(false);

    if (insertError) {
      setError("Ошибка при отправке заявки");
    } else {
      setSuccess(true);
      setMessage("");
      setTopicId(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Заказать картину</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Тема</label>
        <select
          value={topicId ?? ""}
          onChange={(e) => setTopicId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">Выберите тему</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Сообщение</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Опишите, что именно вы хотите..."
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Заявка успешно отправлена!</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Отправка..." : "Отправить заявку"}
      </button>
    </form>
  );
}
