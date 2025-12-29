import { useState } from "react";
import { useNavigate, Link } from "react-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Email xác nhận thành công! Chuyển đến trang đặt lại mật khẩu.");
      navigate(`/reset-password?email=${email}`);
    } else {
      alert("Email không tồn tại trong hệ thống!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-orange-500">
        <h2 className="text-2xl font-bold text-center mb-4">Quên mật khẩu</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Nhập email bạn đã đăng ký để khôi phục tài khoản.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email của bạn" 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition">Tiếp tục</button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/sign-in" className="text-blue-500 hover:underline">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}