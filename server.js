const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Cho phép truy cập file tĩnh (ảnh, html, css, js)

// ==========================================
// 1. HÀM HỖ TRỢ ĐỌC/GHI FILE DB.JSON
// ==========================================
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // Tạo dữ liệu mặc định nếu file db.json chưa tồn tại
            const defaultData = { 
                products: [], 
                settings: { hero_sliders: [], topbar_img: '', friday_banner: '', qr_donate: '' }, 
                users: [], 
                orders: [] 
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        
        // Đảm bảo các mảng luôn tồn tại để tránh lỗi
        if (!data.users) data.users = [];
        if (!data.orders) data.orders = [];
        if (!data.settings) data.settings = { hero_sliders: [] };
        if (!data.settings.hero_sliders) data.settings.hero_sliders = [];
        
        return data;
    } catch (err) {
        console.error("Lỗi đọc file db.json:", err);
        return { products: [], settings: { hero_sliders: [] }, users: [], orders: [] };
    }
}

function writeDB(data) { 
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8'); 
}

// ==========================================
// 2. CẤU HÌNH UPLOAD ẢNH (MULTER)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './images';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Đặt tên file tránh trùng lặp: upload_thoigian_tendulieu
        cb(null, 'upload_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 3. MIDDLEWARE XÁC THỰC ADMIN
// ==========================================
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer my-secret-token-123') {
        next(); // Cho phép đi tiếp
    } else {
        res.status(403).json({ success: false, message: 'Không có quyền truy cập!' });
    }
};

// ==========================================
// 4. API ĐĂNG NHẬP ADMIN
// ==========================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Tài khoản Admin cố định
    if (username === 'spmxhhdm' && password === '22122007') {
        res.json({ success: true, token: 'my-secret-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu Admin' });
    }
});

// ==========================================
// 5. API ĐĂNG KÝ / ĐĂNG NHẬP KHÁCH HÀNG
// ==========================================
app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password, address } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Họ tên, Email và Mật khẩu!' });
    }
    
    let dbData = readDB();
    
    // Kiểm tra xem Email hoặc SĐT đã tồn tại chưa
    const exists = dbData.users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || u.phone === phone
    );
    
    if (exists) {
        return res.status(409).json({ success: false, message: 'Email hoặc Số điện thoại này đã được đăng ký!' });
    }
    
    // Lưu thông tin user (bao gồm cả mật khẩu để admin xem)
    const newUser = { 
        id: Date.now(), 
        name, 
        email: email.toLowerCase(), 
        phone: phone || 'Chưa có', 
        password, 
        address: address || 'Chưa có',
        createdAt: new Date().toLocaleString('vi-VN') 
    };
    
    dbData.users.push(newUser);
    writeDB(dbData);
    
    res.json({ success: true, message: 'Đăng ký thành công!' });
});

app.post('/api/auth/login', (req, res) => {
    const { loginAccount, password } = req.body;
    let dbData = readDB();
    
    // Tìm user khớp email hoặc số điện thoại
    const user = dbData.users.find(u => 
        (u.email.toLowerCase() === loginAccount.toLowerCase() || u.phone === loginAccount) 
        && u.password === password
    );
    
    if (!user) {
        return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }
    
    // Xóa password trước khi gửi về client để bảo mật (tùy chọn)
    const { password: _, ...userData } = user; 
    res.json({ success: true, message: 'Đăng nhập thành công!', data: userData });
});

// ==========================================
// 6. API ĐẶT HÀNG
// ==========================================
app.post('/api/orders', (req, res) => {
    const { customerName, phone, address, userEmail, items, total } = req.body;
    
    let dbData = readDB();
    
    const newOrder = {
        id: 'ORD' + Date.now(),
        customer: customerName || 'Khách vãng lai',
        phone: phone || 'Chưa có',
        address: address || 'Chưa có',
        userEmail: userEmail || 'guest', // Lưu email người mua để admin đối chiếu
        items: items || [],
        total: Number(total) || 0,
        date: new Date().toLocaleString('vi-VN'),
        status: 'Chờ xử lý'
    };
    
    dbData.orders.push(newOrder);
    writeDB(dbData);
    
    res.json({ success: true, message: 'Đặt hàng thành công!', data: { orderId: newOrder.id } });
});

// ==========================================
// 7. API QUẢN LÝ SẢN PHẨM (ADMIN)
// ==========================================
app.post('/api/admin/add-product', verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Thiếu file ảnh" });
    
    const { name, price, category, stock, sub_category } = req.body; 
    let dbData = readDB();
    
    dbData.products.push({ 
        id: Date.now(), 
        name, 
        price: Number(price), 
        category: category || 'khac', 
        sub_category: sub_category || '', 
        stock: Number(stock) || 0,
        image: `/images/${req.file.filename}` 
    });
    
    writeDB(dbData);
    res.json({ success: true });
});

app.put('/api/admin/edit-product/:id', verifyAdmin, upload.single('image'), (req, res) => {
    const id = Number(req.params.id);
    const { name, price, category, stock, sub_category } = req.body;
    let dbData = readDB();
    
    const product = dbData.products.find(p => p.id === id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    product.name = name || product.name;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
    product.sub_category = sub_category || ''; 
    product.stock = stock ? Number(stock) : product.stock;
    
    // Nếu có upload ảnh mới thì cập nhật, không thì giữ nguyên ảnh cũ
    if (req.file) {
        product.image = `/images/${req.file.filename}`;
    }

    writeDB(dbData);
    res.json({ success: true });
});

app.delete('/api/admin/delete-product/:id', verifyAdmin, (req, res) => {
    let dbData = readDB();
    dbData.products = dbData.products.filter(p => p.id !== Number(req.params.id));
    writeDB(dbData);
    res.json({ success: true });
});

app.post('/api/admin/update-stock/:id', verifyAdmin, (req, res) => {
    const id = Number(req.params.id);
    let dbData = readDB();
    const product = dbData.products.find(p => p.id === id);
    
    if (product) { 
        product.stock = Number(req.body.stock); 
        writeDB(dbData); 
        res.json({ success: true }); 
    } else {
        res.status(404).json({ success: false });
    }
});

// ==========================================
// 8. API QUẢN LÝ BANNER & SETTINGS
// ==========================================
app.post('/api/admin/upload-banner', verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Thiếu file ảnh" });
    
    const type = req.body.type; // topbar_img, friday_banner, hero_slider, qr_donate
    const imageUrl = `/images/${req.file.filename}`; 
    let dbData = readDB();
    
    if (type === 'hero_slider') {
        dbData.settings.hero_sliders.push({ image: imageUrl, link: '#' });
    } else {
        dbData.settings[type] = imageUrl;
    }
    
    writeDB(dbData);
    res.json({ success: true });
});

app.delete('/api/admin/delete-banner/:type', verifyAdmin, (req, res) => {
    const type = req.params.type;
    const index = req.query.index; 
    let dbData = readDB();
    
    if (type === 'hero_slider' && index !== undefined) {
        dbData.settings.hero_sliders.splice(Number(index), 1);
    } else if (type === 'topbar_img' || type === 'friday_banner' || type === 'qr_donate') {
        dbData.settings[type] = ''; 
    }
    
    writeDB(dbData);
    res.json({ success: true });
});

// ==========================================
// 9. API LẤY DỮ LIỆU (PUBLIC & ADMIN)
// ==========================================
// Cho trang chủ
app.get('/api/settings', (req, res) => res.json(readDB().settings || {}));

app.get('/api/products', (req, res) => {
    const db = readDB();
    const { category, sub_category } = req.query;
    let products = db.products || [];
    
    if (category) products = products.filter(p => p.category === category);
    if (sub_category) products = products.filter(p => p.sub_category === sub_category);
    
    res.json(products);
});

// Cho Admin
app.get('/api/admin/users', verifyAdmin, (req, res) => res.json(readDB().users));
app.get('/api/admin/orders', verifyAdmin, (req, res) => res.json(readDB().orders));

// ==========================================
// KHỞI CHẠY SERVER
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});