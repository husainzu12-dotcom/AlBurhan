require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Fallback SQLite for sessions (can be replaced with Supabase later)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('SQLite fallback:', err.message);
  }
  console.log('Connected to the SQLite database (fallback).');
});

// Initialize database with sample data
async function initializeDatabase() {
  try {
    // Check if admin user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'owner')
      .single();

    if (!existingUser) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await supabase
        .from('users')
        .insert([{ username: 'owner', password: hashedPassword, role: 'admin' }]);
      console.log('Admin user created');
    }

    // Check if products exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (!existingProducts || existingProducts.length === 0) {
      const products = [
        { name: 'V-Belt Pulleys', description: 'High-quality V-belt pulleys designed for efficient power transmission in various industrial applications.', specs: 'Available in multiple sizes, materials, and configurations', price: 100.00, image: 'V-Belt Pulleys' },
        { name: 'Flat Pulleys', description: 'Durable flat belt pulleys for smooth and reliable power transmission systems.', specs: 'Various diameters and face widths available', price: 80.00, image: 'Flat Pulleys' },
        { name: 'Taper Lock Pulleys', description: 'Easy-to-install taper lock pulleys with secure shaft mounting for industrial machinery.', specs: 'Standard taper lock bushings included', price: 120.00, image: 'Taper Lock Pulleys' },
        { name: 'Variable Speed Pulleys', description: 'Adjustable speed pulleys for variable speed applications in industrial equipment.', specs: 'Adjustable speed ratio, smooth operation', price: 150.00, image: 'Variable Speed Pulleys' },
        { name: 'Star Couplings', description: 'Flexible star couplings for connecting shafts with angular and parallel misalignment tolerance.', specs: 'High flexibility, vibration damping', price: 60.00, image: 'Star Couplings' },
        { name: 'Flexible Couplings', description: 'Versatile flexible couplings for smooth power transmission with misalignment compensation.', specs: 'Accommodates angular and parallel misalignment', price: 70.00, image: 'Flexible Couplings' },
        { name: 'Nylon Couplings', description: 'Lightweight and durable nylon couplings for light to medium-duty applications.', specs: 'Corrosion resistant, low maintenance', price: 50.00, image: 'Nylon Couplings' },
        { name: 'Tyre Couplings', description: 'Robust tyre couplings with excellent shock absorption and vibration damping capabilities.', specs: 'High shock load capacity, flexible', price: 90.00, image: 'Tyre Couplings' },
        { name: 'Chain Couplings', description: 'Heavy-duty chain couplings for high-torque applications with excellent durability.', specs: 'High torque capacity, compact design', price: 110.00, image: 'Chain Couplings' },
        { name: 'Encoder Couplings', description: 'Precision encoder couplings for accurate motion control and feedback systems.', specs: 'Zero backlash, high precision', price: 130.00, image: 'Encoder Couplings' },
        { name: 'Spur Gears', description: 'Precision-cut spur gears for parallel shaft power transmission with high efficiency.', specs: 'Various modules and pressure angles available', price: 200.00, image: 'Spur Gears' },
        { name: 'Bevel Gears', description: 'High-quality bevel gears for right-angle power transmission applications.', specs: 'Straight and spiral bevel options', price: 250.00, image: 'Bevel Gears' },
        { name: 'Worm Gears', description: 'Efficient worm gear sets for high reduction ratios and compact design requirements.', specs: 'High reduction ratios, self-locking capability', price: 300.00, image: 'Worm Gears' },
        { name: 'Racks & Pinions', description: 'Precision racks and pinions for linear motion applications in automation systems.', specs: 'Various modules and lengths available', price: 180.00, image: 'Racks & Pinions' },
        { name: 'Chain Sprockets', description: 'Durable chain sprockets for roller chain drives with precise tooth profiles.', specs: 'ANSI and ISO standards, various tooth counts', price: 40.00, image: 'Chain Sprockets' },
        { name: 'Roller Chains', description: 'Heavy-duty roller chains for reliable power transmission in industrial machinery.', specs: 'ANSI standard sizes, high strength', price: 30.00, image: 'Roller Chains' },
        { name: 'Universal Joints', description: 'Robust universal joints for connecting shafts at various angles with smooth operation.', specs: 'High angular capacity, durable construction', price: 85.00, image: 'Universal Joints' }
      ];

      await supabase.from('products').insert(products);
      console.log('Sample products inserted');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user });
});

app.get('/products', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    res.render('products', { user: req.session.user, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Database error');
  }
});

app.get('/cart', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    res.render('cart', { user: req.session.user, cart: req.session.cart || [], products });
  } catch (error) {
    console.error('Error fetching products for cart:', error);
    res.status(500).send('Database error');
  }
});

app.get('/blog', (req, res) => {
  res.render('blog', { user: req.session.user });
});

app.get('/contact', (req, res) => {
  res.render('contact', { user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.session.user, error: null });
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.render('login', { user: req.session.user, error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.redirect('/admin');
    } else {
      res.render('login', { user: req.session.user, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { user: req.session.user, error: 'Login failed' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.render('admin', { user: req.session.user, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Database error');
  }
});

app.get('/admin/order/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  try {
    const orderId = req.params.id;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).send('Order not found');
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products (
          name
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    res.render('order-details', { user: req.session.user, order, items });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).send('Database error');
  }
});

app.post('/admin/order/:id/update-status', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Unauthorized');
  }
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;

    res.redirect('/admin/order/' + orderId);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Database error');
  }
});

// Add to cart (using session)
app.post('/add-to-cart', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const existingItem = req.session.cart.find(item => item.productId == productId);
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    req.session.cart.push({ productId: parseInt(productId), quantity: parseInt(quantity) });
  }
  res.redirect('/cart');
});

// Remove from cart
app.post('/remove-from-cart', (req, res) => {
  const { productId } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId != productId);
  }
  res.redirect('/cart');
});

// Checkout (simplified, just create order)
app.post('/checkout', async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/products');
  }

  try {
    // Get product details for all cart items
    const productIds = req.session.cart.map(item => item.productId);
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (error) throw error;

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = req.session.cart.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
        total += product.price * cartItem.quantity;
        return {
          product_id: cartItem.productId,
          quantity: cartItem.quantity,
          price: product.price
        };
      }
      return null;
    }).filter(item => item !== null);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ total, status: 'ordered' }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    // Clear cart
    req.session.cart = [];
    res.redirect('/products');
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).send('Checkout failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});