import { useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import PresentationModal from "./PresentationModal";

const nodeTypes = ["Explanation", "Question", "Link", "Definition"];

export default function ChainBoard() {
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isPresenting, setIsPresenting] = useState(false);
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [boardTitle, setBoardTitle] = useState("Untitled Board");
    const [dragFrom, setDragFrom] = useState(null);

    const boardRef = useRef(null);

    function addNode(x = 200, y = 200, fromId = null) {
        const newNode = {
            id: uuid(),
            x,
            y,
            text: "",
            type: "Explanation",
        };
        setNodes(prev => [...prev, newNode]);
        setActiveNodeId(newNode.id);
        setEditingNodeId(newNode.id);
        if (fromId) setLinks(prev => [...prev, { from: fromId, to: newNode.id }]);
    }

    function deleteNode(id) {
        setNodes(nodes.filter(n => n.id !== id));
        setLinks(links.filter(l => l.from !== id && l.to !== id));
        setActiveNodeId(null);
        setEditingNodeId(null);
    }

    function updateNode(id, key, value) {
        setNodes(nodes.map(n => n.id === id ? { ...n, [key]: value } : n));
    }

    function handleMouseDown(e, id) {
        e.stopPropagation();
        setDraggingNodeId(id);
    }

    function handleMouseMove(e) {
        const bounds = boardRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });

        if (draggingNodeId) {
            const newX = e.clientX - bounds.left - 100;
            const newY = e.clientY - bounds.top - 20;
            setNodes(nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
        }
    }

    function handleMouseUp() {
        setDraggingNodeId(null);
        if (dragFrom) {
            addNode(mousePos.x - 100, mousePos.y - 20, dragFrom.fromId);
            setDragFrom(null);
        }
    }

    function startDragFromNode(id, position) {
        setDragFrom({ fromId: id, position });
    }

    function completeConnection(toId) {
        if (dragFrom && dragFrom.fromId !== toId) {
            setLinks([...links, { from: dragFrom.fromId, to: toId }]);
        }
        setDragFrom(null);
    }

    const positions = ["top", "bottom", "left", "right"];

    function getPointOffset(pos, node) {
        const offset = { top: [128, 0], bottom: [128, 96], left: [0, 48], right: [256, 48] };
        return offset[pos] || [128, 48];
    }

    return (
        <div
            className="w-full h-screen bg-white relative"
            ref={boardRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <h1 className="text-xl font-bold text-center mt-6">
                <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setBoardTitle(e.target.textContent)}
                    className="outline-none cursor-text"
                >
                    {boardTitle}
                </span>
                <span className="text-lime-600"> ✎</span>
            </h1>

            <button
                onClick={() => addNode()}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-lime-300 text-black px-6 py-2 rounded-full font-semibold hover:bg-lime-400 transition"
            >
                Add Item +
            </button>

            <button
                onClick={() => setIsPresenting(true)}
                className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
            >
                Play <span className="text-sm">▶</span>
            </button>

            {nodes.map((node) => (
                <div
                    key={node.id}
                    className="absolute bg-gray-50 p-4 rounded-xl shadow w-64 border cursor-default"
                    style={{ left: node.x, top: node.y }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveNodeId(node.id);
                    }}
                    onMouseUp={() => completeConnection(node.id)}
                >
                    <div className="text-xs inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full mb-2">
                        {node.type}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{node.text || "(No content)"}</p>

                    {(activeNodeId === node.id || dragFrom) && (
                        <>
                            {activeNodeId === node.id && (
                                <div className="absolute top-2 right-2 flex gap-2 z-10">
                                    <button
                                        className="text-white bg-black rounded-full p-1 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingNodeId(node.id);
                                        }}
                                    >✏️</button>
                                    <button
                                        className="text-white bg-red-500 rounded-full p-1 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNode(node.id);
                                        }}
                                    >🗑</button>
                                </div>
                            )}
                            {positions.map((pos) => (
                                <div
                                    key={pos}
                                    className={`absolute w-3 h-3 bg-purple-300 rounded-full opacity-70 hover:opacity-100 
                ${pos === "top" ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""}
                ${pos === "bottom" ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" : ""}
                ${pos === "left" ? "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" : ""}
                ${pos === "right" ? "right-0 top-1/2 -translate-y-1/2 translate-x-1/2" : ""}
                cursor-crosshair`}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        startDragFromNode(node.id, pos);
                                    }}
                                    onMouseUp={(e) => {
                                        e.stopPropagation();
                                        completeConnection(node.id);
                                    }}
                                ></div>
                            ))}
                        </>
                    )}

                </div>
            ))}

            {editingNodeId && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[420px]">
                        <h2 className="text-lg font-semibold mb-2">Describe</h2>
                        <select
                            className="text-sm mb-3 w-full border rounded p-1"
                            value={nodes.find(n => n.id === editingNodeId)?.type || "Explanation"}
                            onChange={(e) => updateNode(editingNodeId, "type", e.target.value)}
                        >
                            {nodeTypes.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                        <textarea
                            className="w-full text-sm border p-2 rounded h-32 bg-gray-50"
                            placeholder="Enter text..."
                            value={nodes.find(n => n.id === editingNodeId)?.text || ""}
                            onChange={(e) => updateNode(editingNodeId, "text", e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-4 py-1 text-sm rounded-full border"
                                onClick={() => setEditingNodeId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-1 text-sm rounded-full bg-black text-white"
                                onClick={() => setEditingNodeId(null)}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <svg className="absolute w-full h-full left-0 top-0 pointer-events-none">
                {links.map((link, i) => {
                    const from = nodes.find(n => n.id === link.from);
                    const to = nodes.find(n => n.id === link.to);
                    if (!from || !to) return null;

                    const [x1, y1] = getPointOffset("right", from);
                    const [x2, y2] = getPointOffset("left", to);

                    const d = `M${from.x + x1},${from.y + y1} C${from.x + x1 + 50},${from.y + y1} ${to.x + x2 - 50},${to.y + y2} ${to.x + x2},${to.y + y2}`;

                    return (
                        <path
                            key={i}
                            d={d}
                            fill="none"
                            stroke="gray"
                            strokeWidth="2"
                            markerEnd="url(#arrow)"
                        />
                    );
                })}

                {dragFrom && (() => {
                    const from = nodes.find(n => n.id === dragFrom.fromId);
                    if (!from) return null;
                    const [x1, y1] = getPointOffset(dragFrom.position, from);

                    const d = `M${from.x + x1},${from.y + y1} C${from.x + x1 + 50},${from.y + y1} ${mousePos.x - 50},${mousePos.y} ${mousePos.x},${mousePos.y}`;

                    return (
                        <path
                            d={d}
                            fill="none"
                            stroke="gray"
                            strokeDasharray="5,5"
                            strokeWidth="2"
                        />
                    );
                })()}

                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto">
                        <path d="M0,0 L10,5 L0,10 Z" fill="gray" />
                    </marker>
                </defs>
            </svg>

            {isPresenting && (
                <PresentationModal nodes={nodes} onClose={() => setIsPresenting(false)} />
            )}
        </div>
    );
}
