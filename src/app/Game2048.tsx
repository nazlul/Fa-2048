"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { NextRequest } from 'next/server';

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

export async function GET(req: NextRequest) {
  return new Response(
    `
    <html>
      <head>
        <meta property="og:title" content="Sign in with Farcaster" />
        <meta property="og:image" content="https://fa-2048.vercel.app/banner.png" />
        <meta property="og:description" content="Sign in to 2048 with your Farcaster account!" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:button:1" content="Sign in" />
        <meta property="fc:frame:post_url" content="https://fa-2048.vercel.app/api/frame" />
      </head>
      <body></body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  return new Response(
    `
    <html>
      <head>
        <meta property="og:title" content="Signed in with Farcaster!" />
        <meta property="og:image" content="https://fa-2048.vercel.app/banner.png" />
        <meta property="og:description" content="You are now signed in to 2048 with Farcaster." />
        <meta property="fc:frame" content="vNext" />
      </head>
      <body></body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

const Game2048: React.FC = () => {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const [board, setBoard] = useState<number[][]>(initialBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [highscore, setHighscore] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("highscore");
      if (stored) setHighscore(Number(stored));
    }
  }, []);

  useEffect(() => {
    if (score > highscore) {
      setHighscore(score);
      if (typeof window !== "undefined") {
        localStorage.setItem("highscore", String(score));
      }
    }
  }, [score, highscore]);

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

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) handleMove("right");
      else if (dx < -30) handleMove("left");
    } else {
      if (dy > 30) handleMove("down");
      else if (dy < -30) handleMove("up");
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const restart = () => {
    setBoard(initialBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const userPfp = user?.farcaster?.pfp ?? null;
  let userName: string = "User";
  if (user?.farcaster?.username) {
    userName = user.farcaster.username;
  } else if (typeof user?.email === "string") {
    userName = user.email;
  } else if (user?.email && typeof user.email === "object" && "address" in user.email) {
    userName = String(user.email.address);
  }

  // Share to Farcaster handler
  const shareToFarcaster = () => {
    const text = encodeURIComponent("Play 2048 on Farcaster! https://farcaster.xyz/miniapps/vu0eaa6LJ0gM/2048");
    window.open(`https://warpcast.com/~/compose?text=${text}`, "_blank");
  };

  return (
    <div
      className="flex flex-col items-center"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }}
    >
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
          <div className="flex items-center text-[#776e65] font-bold mb-2 gap-2">
            {userPfp && (
              <img
                src={userPfp}
                alt="pfp"
                className="w-8 h-8 rounded-full border border-[#bbada0]"
                style={{ objectFit: "cover" }}
              />
            )}
            <span>Signed in as {userName} (FID: {user?.farcaster?.fid})</span>
          </div>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        <div className="bg-[#bbada0] rounded px-4 py-2 text-white font-bold text-lg">Score: {score}</div>
        <div className="bg-[#bbada0] rounded px-4 py-2 text-white font-bold text-lg">Highscore: {highscore}</div>
      </div>
      <div className="relative bg-[#bbada0] p-4 rounded-lg shadow-lg mb-4" style={{ width: 352, height: 352 }}>
        {(gameOver || won) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg"
            style={{ pointerEvents: "auto" }}
          >
            <div className={`text-3xl font-bold mb-2 ${won ? "text-green-300" : "text-red-300"}`}>
              {won ? "You Win!" : "Game Over!"}
            </div>
            <button
              className="bg-[#8f7a66] text-white px-4 py-2 rounded font-bold hover:bg-[#a39489] mt-2"
              onClick={restart}
            >
              Restart
            </button>
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 relative z-0" style={{ width: 320, height: 320 }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="w-20 h-20 flex items-center justify-center rounded font-bold text-2xl"
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
          onClick={shareToFarcaster}
        >
          Share to Farcaster
        </button>
      </div>
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2 text-[#776e65]">Highscores</h2>
        <div className="bg-[#eee4da] rounded p-4 text-[#776e65] flex items-center gap-2">
          {userPfp && (
            <img
              src={userPfp}
              alt="pfp"
              className="w-8 h-8 rounded-full border border-[#bbada0]"
              style={{ objectFit: "cover" }}
            />
          )}
          <span className="font-bold">{userName}</span>
          <span>Highscore: {highscore}</span>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
