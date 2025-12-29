import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Cập nhật mật khẩu thành công!");
      navigate("/sign-in");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border-t-4 border-green-500">
        <h2 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-gray-600">Email: <b>{email}</b></p>
          <input 
            type="password" 
            placeholder="Mật khẩu mới" 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <button className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Lưu mật khẩu mới</button>
        </form>
      </div>
    </div>
  );
}