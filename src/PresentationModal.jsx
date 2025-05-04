import React, { useState } from "react";

export default function PresentationModal({ nodes, links, onClose }) {
    // Получаем узлы по id
    const getNodeById = (id) => nodes.find((n) => n.id === id);

    // Фильтруем связи, идущие от данного узла
    const getConnectedNodes = (id) => {
        return links
            .filter((link) => link.from === id)
            .map((link) => getNodeById(link.to))
            .filter(Boolean);
    };

    // Сортировка по типу для одного Explanation
    const sortByType = (children) => ({
        definitions: children.filter((n) => n.type === "Definition"),
        questions: children.filter((n) => n.type === "Question"),
        links: children.filter((n) => n.type === "Link"),
    });

    // Генерация слайдов
    const explanationNodes = nodes.filter((n) => n.type === "Explanation");

    const slides = explanationNodes.flatMap((expNode) => {
        const children = getConnectedNodes(expNode.id);
        const sorted = sortByType(children);

        const localSlides = [
            {
                title: `Topic: ${expNode.text.slice(0, 30)}`,
                content: expNode.text || "(No content)",
            },
        ];

        if (sorted.definitions.length > 0) {
            localSlides.push({
                title: "Definitions",
                content: sorted.definitions.map((n) => `📘 ${n.text}`).join("\n\n"),
            });
        }

        if (sorted.questions.length > 0) {
            localSlides.push({
                title: "Questions",
                content: sorted.questions.map((n) => `❓ ${n.text}`).join("\n\n"),
            });
        }

        if (sorted.links.length > 0) {
            localSlides.push({
                title: "Links",
                content: sorted.links.map((n) => `🔗 ${n.text}`).join("\n\n"),
            });
        }

        return localSlides;
    });

    // В начало добавим вводный слайд, в конец — заключение
    const title = nodes.find((n) => n.type === "Definition")?.text || "Untitled";
    slides.unshift({ title: "Introduction", content: title });
    slides.push({
        title: "Summary",
        content: "This presentation was generated from your ChainBoard.",
    });

    const [index, setIndex] = useState(0);
    const current = slides[index];

    return (
        <div className="fixed inset-0 bg-white z-50 p-8 overflow-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{current.title}</h2>
                <button onClick={onClose} className="text-red-500 text-sm hover:underline">
                    ✖ Close
                </button>
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
                <span className="text-sm text-gray-500">
          {index + 1} / {slides.length}
        </span>
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
