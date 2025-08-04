export default function StatusBar() {
  const online = true; // depois conecta com API

  return (
    <footer className="w-full bg-gray-800 text-white text-sm p-2 flex justify-between items-center">
      <span>
        Status:{" "}
        <span className={online ? "text-green-400" : "text-red-400"}>
          {online ? "Online" : "Offline"}
        </span>
      </span>
      <span>v1.0.0</span>
    </footer>
  );
}
