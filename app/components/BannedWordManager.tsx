"use client";

import { BannedWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BannedWordManager({ words }: { words: BannedWord[] }) {
  const router = useRouter();
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banned-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: newWord.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add word");
      }
      setNewWord("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    try {
      await fetch(`/api/admin/banned-words/${wordId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (err) {
      alert("Failed to delete word");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 max-w-md">
      <h3 className="text-lg font-medium mb-4">Manage Banned Words</h3>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleAddWord} className="flex gap-2">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Add a word (e.g., 'spam')"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Add"}
        </button>
      </form>
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {words.length === 0 && (
          <p className="text-sm text-gray-500">No banned words yet.</p>
        )}
        {words.map((word) => (
          <div
            key={word.id}
            className="flex justify-between items-center p-2 bg-white border rounded-md"
          >
            <span className="text-sm">{word.word}</span>
            <button
              onClick={() => handleDeleteWord(word.id)}
              className="text-xs text-white bg-red-500 px-2 py-2 rounded hover:bg-red-700 "
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}