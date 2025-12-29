const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- 1. CẤU HÌNH MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. KẾT NỐI DATABASE (MongoDB Atlas) ---
const mongoURI = "mongodb+srv://nguyenththngan0108_db_user:wTdFpAK9wqLWgdRA@saas.daqq5tk.mongodb.net/?appName=Saas";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Kết nối MongoDB Atlas thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối Database:", err));

// --- 3. ĐỊNH NGHĨA MODELS ---
// Model User hỗ trợ phân cấp gói dịch vụ (Billing)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false } // Mặc định là gói FREE
});
const User = mongoose.model('User', UserSchema);

// Model Task quản lý tiến độ công việc
const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    status: { type: String, default: "pending" }, // pending hoặc completed
    createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// --- 4. HỆ THỐNG API ---

// [Auth] Đăng ký & Đăng nhập
app.post('/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: "Email đã tồn tại!" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne(req.body);
        if (user) res.json({ success: true, token: user._id });
        else res.status(401).json({ success: false });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// [Billing & User] Kiểm tra trạng thái và Quên mật khẩu
app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json({ success: true, isPremium: user.isPremium });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/forgot-password', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) res.json({ success: true });
    else res.status(404).json({ success: false });
});

app.post('/reset-password', async (req, res) => {
    await User.findOneAndUpdate({ email: req.body.email }, { password: req.body.newPassword });
    res.json({ success: true });
});

// [Payment] Nâng cấp tài khoản Premium
app.post('/upgrade-premium', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.body.userId, { isPremium: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// [Tasks] CRUD Công việc có giới hạn gói FREE
app.get('/tasks/:userId', async (req, res) => {
    const tasks = await Task.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
});

app.post('/tasks', async (req, res) => {
    const { userId, title } = req.body;
    const user = await User.findById(userId);
    const count = await Task.countDocuments({ userId });

    // Giới hạn 5 task cho tài khoản thường (Billing logic)
    if (!user.isPremium && count >= 5) {
        return res.json({ success: false, message: "Gói FREE đạt giới hạn 5 task. Hãy nâng cấp!" });
    }

    const newTask = new Task({ userId, title });
    await newTask.save();
    res.status(201).json({ success: true, task: newTask });
});

app.patch('/tasks/:id', async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
});

app.delete('/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- 5. CHẠY SERVER ---
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));