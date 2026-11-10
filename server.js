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
            const defaultData = { products: [], settings: { hero_sliders: [] }, users: [], orders: [] };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (!data.users) data.users = [];
        if (!data.orders) data.orders = [];
        if (!data.settings) data.settings = { hero_sliders: [] };
        return data;
    } catch (err) {
        return { products: [], settings: { hero_sliders: [] }, users: [], orders: [] };
    }
}
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8'); }

// --- Upload ---
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

// --- API ĐĂNG NHẬP ADMIN ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'spmxhhdm' && password === '22122007') {
        res.json({ success: true, token: 'my-secret-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
});

// --- API ĐĂNG KÝ / ĐĂNG NHẬP KHÁCH ---
app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin!' });
    
    let dbData = readDB();
    const exists = dbData.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
    if (exists) return res.status(409).json({ success: false, message: 'Email hoặc SĐT đã được đăng ký!' });
    
    dbData.users.push({ 
        id: Date.now(), name, email: email.toLowerCase(), phone: phone || 'Chưa có', 
        password, address: address || 'Chưa có', createdAt: new Date().toLocaleString('vi-VN') 
    });
    writeDB(dbData);
    res.json({ success: true, message: 'Đăng ký thành công!' });
});

app.post('/api/auth/login', (req, res) => {
    const { loginAccount, password } = req.body;
    let dbData = readDB();
    const user = dbData.users.find(u => 
        (u.email.toLowerCase() === loginAccount.toLowerCase() || u.phone === loginAccount) 
        && u.password === password
    );
    if (!user) return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    
    const { password: _, ...userData } = user; 
    res.json({ success: true, message: 'Đăng nhập thành công!', data: userData });
});

// --- API ĐẶT HÀNG & QUẢN LÝ ĐƠN HÀNG ---
app.post('/api/orders', (req, res) => {
    const { customerName, phone, address, userEmail, items, total } = req.body;
    let dbData = readDB();
    
    const newOrder = {
        id: 'ORD' + Date.now(),
        customer: customerName || 'Khách vãng lai',
        phone: phone || 'Chưa có',
        address: address || 'Chưa có',
        userEmail: userEmail || 'guest',
        items: items || [],
        total: Number(total) || 0,
        date: new Date().toLocaleString('vi-VN'),
        status: 'Chờ xử lý'
    };
    dbData.orders.push(newOrder);
    writeDB(dbData);
    res.json({ success: true, message: 'Đặt hàng thành công!' });
});

app.get('/api/orders/user/:email', (req, res) => {
    const email = req.params.email;
    let dbData = readDB();
    const userOrders = dbData.orders.filter(o => o.userEmail === email);
    userOrders.sort((a, b) => b.id.localeCompare(a.id)); 
    res.json(userOrders);
});

app.put('/api/admin/update-order-status/:id', verifyAdmin, (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    let dbData = readDB();
    const order = dbData.orders.find(o => o.id === id);
    
    if (order) {
        order.status = status; 
        writeDB(dbData);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }
});

// --- CÁC API KHÁC ---
app.post('/api/admin/add-product', verifyAdmin, upload.single('image'), (req, res) => {
    const { name, price, category, stock, sub_category } = req.body; 
    let dbData = readDB();
    dbData.products.push({ 
        id: Date.now(), name, price: Number(price), category: category || 'khac', 
        sub_category: sub_category || '', stock: Number(stock) || 0, image: `/images/${req.file.filename}` 
    });
    writeDB(dbData);
    res.json({ success: true });
});

app.put('/api/admin/edit-product/:id', verifyAdmin, upload.single('image'), (req, res) => {
    const id = Number(req.params.id);
    const { name, price, category, stock } = req.body;
    let dbData = readDB();
    const product = dbData.products.find(p => p.id === id);
    if (product) {
        product.name = name || product.name;
        product.price = Number(price) || product.price;
        product.category = category || product.category;
        product.stock = Number(stock) || product.stock;
        if (req.file) product.image = `/images/${req.file.filename}`;
        writeDB(dbData);
    }
    res.json({ success: true });
});

app.delete('/api/admin/delete-product/:id', verifyAdmin, (req, res) => {
    let dbData = readDB();
    dbData.products = dbData.products.filter(p => p.id !== Number(req.params.id));
    writeDB(dbData);
    res.json({ success: true });
});

app.post('/api/admin/update-stock/:id', verifyAdmin, (req, res) => {
    let dbData = readDB();
    const product = dbData.products.find(p => p.id === Number(req.params.id));
    if (product) { product.stock = Number(req.body.stock); writeDB(dbData); res.json({ success: true }); }
    else res.status(404).json({ success: false });
});

app.post('/api/admin/upload-banner', verifyAdmin, upload.single('image'), (req, res) => {
    const type = req.body.type;
    const imageUrl = `/images/${req.file.filename}`; 
    let dbData = readDB();
    if (type === 'hero_slider') dbData.settings.hero_sliders.push({ image: imageUrl, link: '#' });
    else dbData.settings[type] = imageUrl;
    writeDB(dbData);
    res.json({ success: true });
});

app.delete('/api/admin/delete-banner/:type', verifyAdmin, (req, res) => {
    const type = req.params.type;
    const index = req.query.index; 
    let dbData = readDB();
    if (type === 'hero_slider' && index !== undefined) dbData.settings.hero_sliders.splice(Number(index), 1);
    else dbData.settings[type] = ''; 
    writeDB(dbData);
    res.json({ success: true });
});

app.get('/api/settings', (req, res) => res.json(readDB().settings || {}));
app.get('/api/products', (req, res) => {
    const db = readDB();
    let products = db.products || [];
    if (req.query.category) products = products.filter(p => p.category === req.query.category);
    if (req.query.sub_category) products = products.filter(p => p.sub_category === req.query.sub_category);
    res.json(products);
});
app.get('/api/admin/users', verifyAdmin, (req, res) => res.json(readDB().users));
app.get('/api/admin/orders', verifyAdmin, (req, res) => res.json(readDB().orders));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server chạy tại: http://localhost:${PORT}`));