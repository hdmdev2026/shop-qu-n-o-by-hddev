const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Phục vụ file tĩnh

// --- Helper Đọc/Ghi DB ---
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // Tạo dữ liệu mẫu ban đầu nếu chưa có file db.json
            const defaultData = { 
                products: [], 
                settings: { hero_sliders: [] }, 
                users: [
                    {id: 1, name: "Nguyễn Văn A", email: "vana@gmail.com", phone: "0987654321"},
                    {id: 2, name: "Trần Thị B", email: "thib@gmail.com", phone: "0123456789"}
                ], 
                orders: [
                    {id: "ORD001", customer: "Nguyễn Văn A", total: 450000, status: "Hoàn thành", date: "2026-05-10"},
                    {id: "ORD002", customer: "Trần Thị B", total: 1200000, status: "Đang giao", date: "2026-05-11"},
                    {id: "ORD003", customer: "Khách vãng lai", total: 250000, status: "Chờ xử lý", date: "2026-05-11"}
                ] 
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (!data.users) data.users = [];
        if (!data.orders) data.orders = [];
        return data;
    } catch (err) {
        return { products: [], settings: {}, users: [], orders: [] };
    }
}

function writeDB(data) { 
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8'); 
}

// --- Cấu hình Upload Ảnh ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './images';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, 'upload_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- Middleware Xác Thực Admin ---
const verifyAdmin = (req, res, next) => {
    if (req.headers.authorization === 'Bearer my-secret-token-123') next();
    else res.status(403).json({ success: false, message: 'Không có quyền truy cập!' });
};

// --- API ĐĂNG NHẬP ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'spmxhhdm' && password === '22122007') {
        res.json({ success: true, token: 'my-secret-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
});

// --- API BANNER ---
app.post('/api/admin/upload-banner', verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    const type = req.body.type;
    const imageUrl = `/images/${req.file.filename}`; 
    let dbData = readDB();
    if (!dbData.settings.hero_sliders) dbData.settings.hero_sliders = [];

    if (type === 'hero_slider') {
        dbData.settings.hero_sliders.push({ image: imageUrl, link: '#' });
    } else {
        dbData.settings[type] = imageUrl;
    }
    writeDB(dbData);
    res.json({ success: true });
});

// --- API SẢN PHẨM ---
app.post('/api/admin/add-product', verifyAdmin, upload.single('image'), (req, res) => {
    const { name, price, category, stock } = req.body; 
    let dbData = readDB();
    dbData.products.push({ 
        id: Date.now(), name, price: Number(price), 
        category: category || 'khac', stock: Number(stock) || 0,
        image: `/images/${req.file.filename}` 
    });
    writeDB(dbData);
    res.json({ success: true });
});

app.delete('/api/admin/delete-product/:id', verifyAdmin, (req, res) => {
    let dbData = readDB();
    dbData.products = dbData.products.filter(p => p.id !== Number(req.params.id));
    writeDB(dbData);
    res.json({ success: true });
});

// --- API KHO ---
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

// --- API LẤY DỮ LIỆU ---
app.get('/api/settings', (req, res) => res.json(readDB().settings || {}));
app.get('/api/products', (req, res) => res.json(readDB().products || []));
app.get('/api/admin/users', verifyAdmin, (req, res) => res.json(readDB().users));
app.get('/api/admin/orders', verifyAdmin, (req, res) => res.json(readDB().orders));

// --- KHỞI ĐỘNG ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});