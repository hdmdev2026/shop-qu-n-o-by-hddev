const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Phục vụ file tĩnh (HTML, CSS, ảnh)

// ─── Helper đọc/ghi DB ───────────────────────────────────────────────────────
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            const defaultData = { products: [], settings: { hero_sliders: [] }, coupons: [], contacts: [], newsletter: [], users: [], orders: [] };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (err) {
        return { products: [], settings: { hero_sliders: [] }, coupons: [], contacts: [], newsletter: [], users: [], orders: [] };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Cấu hình Upload ảnh (Multer) ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './images';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, 'upload_' + Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// ─── Trạm kiểm soát Admin ─────────────────────────────────────────────────────
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer my-secret-token-123') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Không có quyền truy cập!' });
    }
};

// ─── API ĐĂNG NHẬP ADMIN ──────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'spmxhhdm' && password === '22122007') {
        res.json({ success: true, token: 'my-secret-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
});

// ─── CÁC API ADMIN (CẦN XÁC THỰC) ─────────────────────────────────────────────
app.post('/api/admin/upload-banner', verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Không có file ảnh" });
    
    const type = req.body.type;
    const imageUrl = `/images/${req.file.filename}`; 
    let dbData = readDB();
    
    if (!dbData.settings) dbData.settings = { hero_sliders: [] };
    if (!dbData.settings.hero_sliders) dbData.settings.hero_sliders = [];

    if (type === 'hero_slider') {
        dbData.settings.hero_sliders.push(imageUrl);
    } else {
        dbData.settings[type] = imageUrl;
    }
    
    writeDB(dbData);
    res.json({ success: true, url: imageUrl });
});

app.post('/api/admin/add-product', verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Không có file ảnh" });
    
    const { name, price } = req.body;
    const imageUrl = `/images/${req.file.filename}`;
    let dbData = readDB();
    
    if (!dbData.products) dbData.products = [];
    dbData.products.push({ id: Date.now(), name: name, price: Number(price), image: imageUrl });
    
    writeDB(dbData);
    res.json({ success: true });
});

app.delete('/api/admin/delete-product/:id', verifyAdmin, (req, res) => {
    const productId = Number(req.params.id);
    let dbData = readDB();
    
    if (!dbData.products) dbData.products = [];
    
    const initialLength = dbData.products.length;
    dbData.products = dbData.products.filter(p => p.id !== productId);
    
    if (dbData.products.length === initialLength) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    
    writeDB(dbData);
    res.json({ success: true });
});

// ─── API CHO TRANG CHỦ (PUBLIC) ───────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
    let dbData = readDB();
    res.json(dbData.settings || {});
});

app.get('/api/products', (req, res) => {
    const db = readDB();
    const { category } = req.query;
    let products = db.products || [];
    if (category) {
        products = products.filter(p => p.category === category);
    }
    // Trả về mảng trực tiếp để index.html và admin.html dễ đọc
    res.json(products); 
});

app.get('/api/products/:id', (req, res) => {
    const db = readDB();
    const product = db.products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: product });
});

// ─── CÁC API KHÁC (GIỮ LẠI TỪ FILE CŨ CỦA BẠN) ────────────────────────────────
app.post('/api/coupon/check', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
    const db = readDB();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    res.json({ success: true, message: `✅ Áp dụng thành công: ${coupon.desc}`, data: coupon });
});

app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    const db = readDB();
    const newContact = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), subject: subject.trim(), message: message.trim(), createdAt: new Date().toISOString() };
    if (!db.contacts) db.contacts = [];
    db.contacts.push(newContact);
    writeDB(db);
    res.json({ success: true, message: '✅ Tin nhắn của bạn đã được gửi thành công!' });
});

app.get('/api/messages', (req, res) => {
    const db = readDB();
    res.json({ success: true, count: (db.contacts || []).length, data: db.contacts || [] });
});

app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
    const db = readDB();
    if (!db.newsletter) db.newsletter = [];
    const exists = db.newsletter.find(n => n.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trước đó' });
    db.newsletter.push({ email: email.toLowerCase(), subscribedAt: new Date().toISOString() });
    writeDB(db);
    res.json({ success: true, message: '✅ Đăng ký nhận bản tin thành công!' });
});

app.get('/api/subscribers', (req, res) => {
    const db = readDB();
    res.json({ success: true, count: (db.newsletter || []).length, data: db.newsletter || [] });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    const db = readDB();
    if (!db.users) db.users = [];
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ success: false, message: 'Email này đã được đăng ký!' });
    db.users.push({ id: Date.now(), name, email: email.toLowerCase(), phone, password, createdAt: new Date().toISOString() });
    writeDB(db);
    res.json({ success: true, message: 'Đăng ký thành công!' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu!' });
    const db = readDB();
    if (!db.users) db.users = [];
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu!' });
    const { password: _, ...userData } = user;
    res.json({ success: true, message: 'Đăng nhập thành công!', data: userData });
});

app.post('/api/orders', (req, res) => {
    const { userEmail, items, total, discount } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống!' });
    const db = readDB();
    if (!db.orders) db.orders = [];
    const newOrder = { id: 'ORD' + Date.now(), userEmail: userEmail || 'guest', items, total, discount: discount || 0, createdAt: new Date().toISOString(), status: 'pending' };
    db.orders.push(newOrder);
    writeDB(db);
    res.json({ success: true, message: 'Đặt hàng thành công!', data: { orderId: newOrder.id } });
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API không tồn tại' });
});

// ─── Khởi động server ─────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});