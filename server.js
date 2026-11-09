// API Xóa sản phẩm (Yêu cầu xác thực)
app.delete('/api/admin/delete-product/:id', verifyAdmin, (req, res) => {
    const productId = Number(req.params.id);
    let dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    
    if (!dbData.products) dbData.products = [];
    
    // Lọc bỏ sản phẩm có ID trùng với ID cần xóa
    const initialLength = dbData.products.length;
    dbData.products = dbData.products.filter(p => p.id !== productId);
    
    if (dbData.products.length === initialLength) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    
    fs.writeFileSync('./db.json', JSON.stringify(dbData, null, 2));
    res.json({ success: true });
});
// --- THÊM VÀO ĐẦU FILE SERVER.JS ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

app.use(cors());
app.use(express.json()); // Đảm bảo có dòng này để đọc data JSON gửi lên

// Cấu hình lưu ảnh
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

// --- API ĐĂNG NHẬP (TRẢ VỀ CHÌA KHÓA) ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Tài khoản và mật khẩu bạn yêu cầu
    if (username === 'spmxhhdm' && password === '22122007') {
        res.json({ success: true, token: 'my-secret-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
});

// --- TRẠM KIỂM SOÁT (MIDDLEWARE) ---
// Hàm này kiểm tra xem Request có gửi kèm chìa khóa "my-secret-token-123" không
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer my-secret-token-123') {
        next(); // Cho phép đi tiếp
    } else {
        res.status(403).json({ success: false, message: 'Không có quyền truy cập!' });
    }
};

// --- CÁC API ADMIN (BẮT BUỘC PHẢI QUA TRẠM KIỂM SOÁT) ---
app.post('/api/admin/upload-banner', verifyAdmin, upload.single('image'), (req, res) => {
    const type = req.body.type;
    const imageUrl = `/images/${req.file.filename}`; 
    let dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    
    if (!dbData.settings) dbData.settings = { hero_sliders: [] };

    if (type === 'hero_slider') {
        dbData.settings.hero_sliders.push(imageUrl);
    } else {
        dbData.settings[type] = imageUrl;
    }
    
    fs.writeFileSync('./db.json', JSON.stringify(dbData, null, 2));
    res.json({ success: true, url: imageUrl });
});

app.post('/api/admin/add-product', verifyAdmin, upload.single('image'), (req, res) => {
    const { name, price } = req.body;
    const imageUrl = `/images/${req.file.filename}`;
    let dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    
    if (!dbData.products) dbData.products = [];
    dbData.products.push({ id: Date.now(), name: name, price: Number(price), image: imageUrl });
    
    fs.writeFileSync('./db.json', JSON.stringify(dbData, null, 2));
    res.json({ success: true });
});

// API cho trang chủ lấy data (Không cần bảo mật)
app.get('/api/settings', (req, res) => {
    let dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    res.json(dbData.settings || {});
});
app.get('/api/products', (req, res) => {
    let dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    res.json(dbData.products || []);
});

// Các app.listen(3000...) cũ của bạn giữ nguyên bên dưới
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh (HTML, CSS, JS, hình ảnh)
app.use(express.static(__dirname));

// ─── Helper đọc/ghi DB ───────────────────────────────────────────────────────
function readDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (err) {
        return { products: [], coupons: [], contacts: [], newsletter: [], users: [], orders: [] };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── API: Sản phẩm ───────────────────────────────────────────────────────────

// GET /api/products - lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    const db = readDB();
    const { category } = req.query;
    let products = db.products;
    if (category) {
        products = products.filter(p => p.category === category);
    }
    res.json({ success: true, data: products });
});

// GET /api/products/:id - lấy chi tiết 1 sản phẩm
app.get('/api/products/:id', (req, res) => {
    const db = readDB();
    const product = db.products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: product });
});

// ─── API: Coupon ──────────────────────────────────────────────────────────────

// POST /api/coupon/check - kiểm tra coupon
app.post('/api/coupon/check', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
    }
    const db = readDB();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
        return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }
    res.json({ success: true, message: `✅ Áp dụng thành công: ${coupon.desc}`, data: coupon });
});

// ─── API: Liên hệ ─────────────────────────────────────────────────────────────

// POST /api/contact - gửi form liên hệ
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    const db = readDB();
    const newContact = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString()
    };

    db.contacts.push(newContact);
    writeDB(db);

    console.log(`📬 Tin nhắn mới từ: ${name} <${email}>`);
    res.json({ success: true, message: '✅ Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.' });
});

// GET /api/messages - xem danh sách tin nhắn (admin)
app.get('/api/messages', (req, res) => {
    const db = readDB();
    res.json({ success: true, count: db.contacts.length, data: db.contacts });
});

// ─── API: Newsletter ──────────────────────────────────────────────────────────

// POST /api/newsletter - đăng ký nhận bản tin
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    const db = readDB();
    const exists = db.newsletter.find(n => n.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trước đó' });
    }

    db.newsletter.push({ email: email.toLowerCase(), subscribedAt: new Date().toISOString() });
    writeDB(db);

    console.log(`📧 Newsletter đăng ký mới: ${email}`);
    res.json({ success: true, message: '✅ Đăng ký nhận bản tin thành công!' });
});

// GET /api/subscribers - xem danh sách subscriber (admin)
app.get('/api/subscribers', (req, res) => {
    const db = readDB();
    res.json({ success: true, count: db.newsletter.length, data: db.newsletter });
});

// ─── API: Xác thực (Auth) ─────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }
    
    const db = readDB();
    if (!db.users) db.users = [];
    
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        return res.status(409).json({ success: false, message: 'Email này đã được đăng ký!' });
    }
    
    const newUser = { id: Date.now(), name, email: email.toLowerCase(), phone, password, createdAt: new Date().toISOString() };
    db.users.push(newUser);
    writeDB(db);
    
    res.json({ success: true, message: 'Đăng ký thành công!' });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu!' });
    }
    
    const db = readDB();
    if (!db.users) db.users = [];
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
        return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu!' });
    }
    
    // Xóa password trước khi gửi về client
    const { password: _, ...userData } = user;
    res.json({ success: true, message: 'Đăng nhập thành công!', data: userData });
});

// ─── API: Đặt hàng (Orders) ───────────────────────────────────────────────────

// POST /api/orders
app.post('/api/orders', (req, res) => {
    const { userEmail, items, total, discount } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống!' });
    }
    
    const db = readDB();
    if (!db.orders) db.orders = [];
    
    const newOrder = {
        id: 'ORD' + Date.now(),
        userEmail: userEmail || 'guest',
        items,
        total,
        discount: discount || 0,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    db.orders.push(newOrder);
    writeDB(db);
    
    res.json({ success: true, message: 'Đặt hàng thành công!', data: { orderId: newOrder.id } });
});

// ─── Bắt các route không tồn tại ─────────────────────────────────────────────
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API không tồn tại' });
});

// ─── Khởi động server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║   🛍️  LinhTran Store - Backend Server            ║
║   🚀 Server đang chạy tại: http://localhost:${PORT}  ║
╠══════════════════════════════════════════════════╣
║  Các API:                                        ║
║  GET    /api/products         Danh sách SP       ║
║  GET    /api/products/:id     Chi tiết SP        ║
║  POST   /api/coupon/check     Kiểm tra coupon    ║
║  POST   /api/contact          Gửi liên hệ        ║
║  GET    /api/messages         Xem tin nhắn       ║
║  POST   /api/newsletter       Đăng ký email      ║
║  GET    /api/subscribers      Xem subscribers    ║
║  POST   /api/auth/register    Đăng ký tài khoản  ║
║  POST   /api/auth/login       Đăng nhập          ║
║  POST   /api/orders           Đặt hàng           ║
╠══════════════════════════════════════════════════╣
║  Mã giảm giá demo:                               ║
║  SALE10 → Giảm 10%                               ║
║  LINH20 → Giảm 20%                               ║
║  FREE50 → Giảm $50                               ║
╚══════════════════════════════════════════════════╝
    `);
});
