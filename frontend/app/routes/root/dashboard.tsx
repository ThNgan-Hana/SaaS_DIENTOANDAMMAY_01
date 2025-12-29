import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]); 
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- STATE QUẢN LÝ SAAS & THANH TOÁN ---
  const [isPremium, setIsPremium] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qr"); // qr, momo, card
  const [filter, setFilter] = useState("all"); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
    } else {
      fetchTasks(token);
      fetchUserStatus(token); 
    }
  }, [navigate]);

  const fetchUserStatus = async (userId: string) => {
    const res = await fetch(`http://localhost:3000/user/${userId}`);
    const data = await res.json();
    if (data.success) setIsPremium(data.isPremium);
  };

  const fetchTasks = async (userId: string) => {
    const res = await fetch(`http://localhost:3000/tasks/${userId}`);
    const data = await res.json();
    if (data.success) setTasks(data.tasks);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!newTaskTitle.trim() || !token) return;

    setLoading(true);
    const res = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: token, title: newTaskTitle }),
    });
    const data = await res.json();
    if (data.success) {
      setNewTaskTitle("");
      fetchTasks(token);
    } else {
      alert(data.message); // Chặn nếu vượt 5 task gói FREE
    }
    setLoading(false);
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/upgrade-premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: token }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Nâng cấp thành công!");
      setIsPremium(true);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks(localStorage.getItem("token")!);
  };

  const deleteTask = async (id: string) => {
    await fetch(`http://localhost:3000/tasks/${id}`, { method: "DELETE" });
    fetchTasks(localStorage.getItem("token")!);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/sign-in");
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="p-8 bg-white shadow-2xl rounded-3xl text-center border-t-8 border-green-500 max-w-md w-full">
        <h1 className="text-3xl font-black text-gray-800 mb-1">SaaS Manager</h1>
        <p className="text-gray-400 text-[10px] mb-6 tracking-widest uppercase">Cloud Task Evolution</p>

        {/* PHẦN BILLING STATUS */}
        <div className={`mb-6 p-4 rounded-2xl border-2 flex justify-between items-center ${isPremium ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <span className="text-xs font-bold uppercase tracking-tighter">
            Gói: <span className={isPremium ? "text-green-600" : "text-blue-600"}>{isPremium ? "PREMIUM" : "FREE"}</span>
          </span>
          {!isPremium && (
            <button onClick={() => setShowPayment(true)} className="text-[10px] bg-yellow-500 text-white px-4 py-1.5 rounded-full font-black shadow-lg hover:bg-yellow-600 transition-all">
              NÂNG CẤP ($9.99)
            </button>
          )}
        </div>

        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Việc cần làm..."
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit" disabled={loading} className="px-5 py-2 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-600">
            {loading ? "..." : "+"}
          </button>
        </form>

        {/* DANH SÁCH CÔNG VIỆC CHI TIẾT */}
        <div className="text-left">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-black text-gray-700 text-sm">CÔNG VIỆC</h2>
            <div className="flex gap-1">
              {["all", "pending", "completed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`text-[8px] font-bold px-2 py-1 rounded-md uppercase ${filter === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {f === "all" ? "Tất cả" : f === "pending" ? "Chờ" : "Xong"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {filteredTasks.map((task: any) => (
              <div key={task._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-bold ${task.status === "completed" ? "line-through text-gray-300" : "text-gray-700"}`}>{task.title}</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${task.status === "completed" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                    {task.status === "completed" ? "Done" : "Doing"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                  <span className="text-[8px] text-gray-300 font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-3">
                    <button onClick={() => toggleStatus(task._id, task.status)} className="text-[9px] text-blue-500 font-black uppercase hover:underline">Update</button>
                    <button onClick={() => deleteTask(task._id)} className="text-[9px] text-red-400 font-black uppercase hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleLogout} className="mt-8 text-[10px] text-gray-300 font-bold hover:text-red-400 transition-colors uppercase tracking-widest">Logout System</button>
      </div>

      {/* PORTAL THANH TOÁN CHUYÊN NGHIỆP */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20">
            <div className="bg-green-600 p-6 text-white text-center">
              <h2 className="text-xl font-black">CHỌN PHƯƠNG THỨC</h2>
              <p className="text-[10px] opacity-70">Nâng cấp Premium SaaS Account</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2 mb-6">
                {["qr", "momo", "card"].map((m) => (
                  <button key={m} onClick={() => setPaymentMethod(m)} className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === m ? "border-green-500 bg-green-50 scale-105" : "border-gray-50 opacity-50"}`}>
                    <span className="text-lg">{m === "qr" ? "🏦" : m === "momo" ? "💖" : "💳"}</span>
                    <span className="text-[8px] font-black uppercase">{m}</span>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-center">
                {paymentMethod === "qr" && (
                  <div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SAAS-PAYMENT" className="w-24 h-24 mx-auto mb-2 mix-blend-multiply" alt="QR" />
                    <p className="text-[9px] font-bold text-gray-400">QUÉT MÃ VIETQR</p>
                  </div>
                )}
                {paymentMethod === "momo" && <div className="py-6 text-pink-500 font-black text-xs">MOMO: 0987.xxx.xxx</div>}
                {paymentMethod === "card" && <div className="space-y-2 py-2"><input type="text" placeholder="CARD NUMBER" className="w-full p-2 text-[10px] border rounded-lg" /><input type="text" placeholder="CVV" className="w-full p-2 text-[10px] border rounded-lg" /></div>}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center"><span className="text-xs font-bold text-gray-400">TOTAL</span><span className="text-xl font-black text-green-600">$9.99</span></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowPayment(false)} className="flex-1 py-3 text-gray-400 text-[10px] font-black uppercase">Hủy bỏ</button>
                <button onClick={() => { handleUpgrade(); setShowPayment(false); }} className="flex-1 py-3 bg-green-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-green-100 uppercase">Xác nhận</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}