import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const ARC_RPC = process.env.NEXT_PUBLIC_ARC_RPC;

const ABI = [
  "function register(string name) public",
  "function resolve(string name) public view returns (address)"
];

export default function Home() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function registerName() {
    try {
      if (!window.ethereum) return alert("MetaMask is required!");
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.register(name);
      await tx.wait();

      alert(`${name}.arc has been successfully registered!`);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resolveName() {
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(ARC_RPC);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const address = await contract.resolve(query);

      setResult(
        address === "0x0000000000000000000000000000000000000000"
          ? "Not registered"
          : address
      );
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: 50 }}>
      <h1>🪪 ARC Name Service (Testnet)</h1>

      <div style={{ marginTop: 30 }}>
        <h3>Register a Name (.arc)</h3>
        <input
          placeholder="example: hakan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, width: 220 }}
        />
        <br />
        <button
          onClick={registerName}
          disabled={loading || !name}
          style={{ marginTop: 10 }}
        >
          {loading ? "Processing..." : "Register"}
        </button>
      </div>

      <div style={{ marginTop: 50 }}>
        <h3>Resolve a Name</h3>
        <input
          placeholder="example: hakan"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: 220 }}
        />
        <br />
        <button
          onClick={resolveName}
          disabled={loading || !query}
          style={{ marginTop: 10 }}
        >
          {loading ? "Processing..." : "Resolve"}
        </button>

        {result && (
          <p style={{ marginTop: 20 }}>
            <b>{query}.arc</b> address: <code>{result}</code>
          </p>
        )}
      </div>
    </div>
  );
}
