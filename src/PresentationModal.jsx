import React, { useState } from "react";

export default function PresentationModal({ nodes, onClose }) {
    const grouped = {
        Title: nodes.find(n => n.type === "Definition")?.text || "Untitled",
        Explanation: nodes.filter(n => n.type === "Explanation"),
        Questions: nodes.filter(n => n.type === "Question"),
        Links: nodes.filter(n => n.type === "Link"),
    };

    const slides = [
        {
            title: "Introduction",
            content: grouped.Title,
        },
        {
            title: "Concepts",
            content: grouped.Explanation.map((n) => `• ${n.text}`).join("\n\n"),
        },
        {
            title: "Common Questions",
            content: grouped.Questions.map((n) => `❓ ${n.text}`).join("\n\n"),
        },
        {
            title: "Useful Links",
            content: grouped.Links.map((n) => `🔗 ${n.text}`).join("\n\n"),
        },
        {
            title: "Summary",
            content: "This presentation was generated from your ChainBoard.",
        },
    ];

    const [index, setIndex] = useState(0);
    const current = slides[index];

    return (
        <div className="fixed inset-0 bg-white z-50 p-8 overflow-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{current.title}</h2>
                <button onClick={onClose} className="text-red-500 text-sm hover:underline">✖ Close</button>
            </div>

            <pre className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed">
        {current.content}
      </pre>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                    className="px-4 py-2 bg-gray-200 text-sm rounded disabled:opacity-50"
                    disabled={index === 0}
                >
                    ← Back
                </button>
                <span className="text-sm text-gray-500">{index + 1} / {slides.length}</span>
                <button
                    onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded disabled:opacity-50"
                    disabled={index === slides.length - 1}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
