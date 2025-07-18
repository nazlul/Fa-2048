"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";

const tileColors: Record<number, string> = {
  0: "#cdc1b4",
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
};

const initialBoard = () => {
  const board = Array(4)
    .fill(0)
    .map(() => Array(4).fill(0));
  addRandomTile(board);
  addRandomTile(board);
  return board;
};

function addRandomTile(board: number[][]) {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function clone(board: number[][]) {
  return board.map((row) => [...row]);
}

function transpose(board: number[][]) {
  return board[0].map((_, i) => board.map((row) => row[i]));
}

function reverse(board: number[][]) {
  return board.map((row) => [...row].reverse());
}

function moveLeft(board: number[][]) {
  const { newBoard, score } = board.reduce(
    (acc, row) => {
      let arr = row.filter((x) => x !== 0);
      for (let j = 0; j < arr.length - 1; j++) {
        if (arr[j] === arr[j + 1]) {
          arr[j] *= 2;
          acc.score += arr[j];
          arr[j + 1] = 0;
        }
      }
      arr = arr.filter((x) => x !== 0);
      while (arr.length < 4) arr.push(0);
      acc.newBoard.push(arr);
      return acc;
    },
    { newBoard: [], score: 0 } as { newBoard: number[][]; score: number }
  );
  const moved = board.some((row, i) => row.some((cell, j) => cell !== newBoard[i][j]));
  return { newBoard, moved, score };
}

function move(board: number[][], dir: "left" | "right" | "up" | "down") {
  let rotated = board;
  if (dir === "up") rotated = transpose(board);
  if (dir === "down") rotated = reverse(transpose(board));
  if (dir === "right") rotated = reverse(board);
  const { newBoard, moved, score } = moveLeft(rotated);
  if (dir === "up") return { newBoard: transpose(newBoard), moved, score };
  if (dir === "down") return { newBoard: transpose(reverse(newBoard)), moved, score };
  if (dir === "right") return { newBoard: reverse(newBoard), moved, score };
  return { newBoard, moved, score };
}

function isGameOver(board: number[][]) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

const Game2048: React.FC = () => {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const [board, setBoard] = useState<number[][]>(initialBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const handleMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver || won) return;
      const { newBoard, moved, score: gained } = move(board, dir);
      if (moved) {
        addRandomTile(newBoard);
        setBoard(clone(newBoard));
        setScore((s) => s + gained);
        if (newBoard.flat().includes(2048)) setWon(true);
        else if (isGameOver(newBoard)) setGameOver(true);
      }
    },
    [board, gameOver, won]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  const restart = () => {
    setBoard(initialBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full flex flex-col items-center">
        {!ready ? (
          <div className="text-[#776e65]">Loading authentication...</div>
        ) : !authenticated ? (
          <button
            className="bg-[#7d6b5f] text-white px-4 py-2 rounded font-bold hover:bg-[#a39489] mb-2"
            onClick={login}
          >
            Sign in with Farcaster
          </button>
        ) : (
          <div className="text-[#776e65] font-bold mb-2">
            Signed in as {user?.farcaster?.username} (FID: {user?.farcaster?.fid})
          </div>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        <div className="bg-[#bbada0] rounded px-4 py-2 text-white font-bold text-lg">Score: {score}</div>
        <div className="bg-[#bbada0] rounded px-4 py-2 text-white font-bold text-lg">Highscore: --</div>
      </div>
      <div className="bg-[#bbada0] p-4 rounded-lg shadow-lg mb-4">
        <div className="grid grid-cols-4 gap-2">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="w-16 h-16 flex items-center justify-center rounded font-bold text-2xl"
                style={{
                  background: tileColors[cell] || "#3c3a32",
                  color: cell <= 4 ? "#776e65" : "#f9f6f2",
                  transition: "background 0.2s",
                }}
              >
                {cell !== 0 ? cell : ""}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          className="bg-[#8f7a66] text-white px-4 py-2 rounded font-bold hover:bg-[#a39489]"
          onClick={restart}
        >
          Restart
        </button>
        <button
          className="bg-[#f67c5f] text-white px-4 py-2 rounded font-bold hover:bg-[#f65e3b]"
          disabled
        >
          Share to Farcaster
        </button>
      </div>
      {gameOver && (
        <div className="text-red-600 font-bold text-xl mb-2">Game Over!</div>
      )}
      {won && (
        <div className="text-green-600 font-bold text-xl mb-2">You Win!</div>
      )}
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2 text-[#776e65]">Highscores</h2>
        <div className="bg-[#eee4da] rounded p-4 text-[#776e65]">
          <div className="italic">Coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
