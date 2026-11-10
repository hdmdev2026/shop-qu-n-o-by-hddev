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
app.use(express.static(__dirname));

// --- Helper DB ---
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            const defaultData = { 
                products: [], settings: { hero_sliders: [] }, 
                users: [ {id: 1, name: "Nguyễn Văn A", email: "vana@gmail.com", phone: "0987654321"} ], 
                orders: [ {id: "ORD001", customer: "Nguyễn Văn A", total: 450000, status: "Hoàn thành", date: "2026-05-10"} ] 
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (!data.users) data.users = [];
        if (!data.orders) data.orders = [];
        if (!data.settings) data.settings = { hero_sliders: [] };
        if (!data.settings.hero_sliders) data.settings.hero_sliders = [];
        return data;
    } catch (err) {
        return { products: [], settings: { hero_sliders: [] }, users: [], orders: [] };
    }
}
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8'); }

// --- Cấu hình Upload ảnh ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './images';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, 'upload_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const verifyAdmin = (req, res, next) => {
    if (req.headers.authorization === 'Bearer my-secret-token-123') next();
    else res.status(403).json({ success: false, message: 'Không có quyền!' });
};

// --- API Đăng nhập ---
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
    const index = req.query.index; // Dùng cho slider
    let dbData = readDB();
    
    if (type === 'hero_slider' && index !== undefined) {
        dbData.settings.hero_sliders.splice(Number(index), 1);
    } else if (type === 'topbar_img' || type === 'friday_banner') {
        dbData.settings[type] = ''; // Xóa link ảnh
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

// API SỬA SẢN PHẨM MỚI
app.put('/api/admin/edit-product/:id', verifyAdmin, upload.single('image'), (req, res) => {
    const id = Number(req.params.id);
    const { name, price, category, stock } = req.body;
    let dbData = readDB();
    const product = dbData.products.find(p => p.id === id);

    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy SP" });

    product.name = name || product.name;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
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
    } else res.status(404).json({ success: false });
});

// --- API LẤY DỮ LIỆU ---
app.get('/api/settings', (req, res) => res.json(readDB().settings || {}));
app.get('/api/products', (req, res) => res.json(readDB().products || []));
app.get('/api/admin/users', verifyAdmin, (req, res) => res.json(readDB().users));
app.get('/api/admin/orders', verifyAdmin, (req, res) => res.json(readDB().orders));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server chạy tại: http://localhost:${PORT}`));