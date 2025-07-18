import Game2048 from "./Game2048";

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex flex-col items-center justify-center bg-[#faf8ef] p-4">
      <h1 className="text-4xl font-bold mb-2 text-[#776e65]">2048</h1>
      <p className="mb-6 text-[#776e65]">Join the numbers and get to the <b>2048</b> tile!</p>
      <Game2048 />
    </div>
  );
}
