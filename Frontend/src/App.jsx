import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MapPin, Clock, Search, Star, RefreshCw, ClipboardList, Phone, Mail, Truck, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import { menuAPI, orderAPI, contactAPI, adminAPI } from './services/api';
import brandImage from './assets/hero.png';
import './App.css'; // Make sure this matches your CSS file name

const WHATSAPP_NUMBER = '923000000000';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi Johnny & Jugnu, I would like to place an order.');

function WhatsAppIcon({ size = 24 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.27-1.38a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.51 2 12.04 2Zm.01 18.14h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23a8.22 8.22 0 0 1-.01 16.46Zm4.51-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.08-.4-.12-.56.12-.17.25-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function AdminPinGate({ error, onSubmit }) {
  const [pin, setPin] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(pin.trim());
  };

  return (
    <main className="admin-page admin-login-page min-vh-100">
      <form className="admin-login glass-panel" onSubmit={handleSubmit}>
        <a href="/" className="text-decoration-none fs-3 fw-black fst-italic text-brand-yellow font-heading">
          JOHNNY<span className="text-brand-red">&</span>JUGNU
        </a>
        <div>
          <h1 className="font-heading text-uppercase mb-1">Admin Access</h1>
          <p className="text-white-50 mb-0">Enter your PIN to view active orders.</p>
        </div>
        {error && <div className="alert alert-danger mb-0">{error}</div>}
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          className="form-control premium-input bg-transparent text-white border-secondary glass-card py-3 rounded-3"
          placeholder="PIN"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          required
          autoFocus
        />
        <button type="submit" className="btn bg-brand-red text-white py-3 fw-bold neon-box-red rounded-3">
          Unlock Admin
        </button>
      </form>
    </main>
  );
}

function AdminOrdersPage() {
  const [adminPin, setAdminPin] = useState(() => sessionStorage.getItem('adminPin') || '');
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  const fetchActiveOrders = useCallback(async (showLoading = true) => {
    if (!adminPin) return;

    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }
      const response = await adminAPI.getActiveOrders();
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Error fetching active orders:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('adminPin');
        setAdminPin('');
        setAuthError('Invalid PIN. Please try again.');
        return;
      }
      setError('Failed to load active orders. Please check the backend connection.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [adminPin]);

  useEffect(() => {
    if (!adminPin) return undefined;

    const timer = window.setTimeout(() => {
      fetchActiveOrders(false).finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [adminPin, fetchActiveOrders]);

  const handlePinSubmit = (pin) => {
    sessionStorage.setItem('adminPin', pin);
    setAuthError('');
    setLoading(true);
    setAdminPin(pin);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminPin');
    setAdminPin('');
    setOrders([]);
    setError(null);
    setAuthError('');
  };

  const handleStatusChange = async (orderNumber, status) => {
    try {
      setUpdatingOrder(orderNumber);
      const response = await adminAPI.updateOrderStatus(orderNumber, status);
      const updatedOrder = response.data.data;

      if (['delivered', 'cancelled'].includes(updatedOrder.orderStatus)) {
        setOrders((currentOrders) => currentOrders.filter((order) => order.orderNumber !== orderNumber));
      } else {
        setOrders((currentOrders) =>
          currentOrders.map((order) => order.orderNumber === orderNumber ? updatedOrder : order)
        );
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('adminPin');
        setAdminPin('');
        setAuthError('Session expired or PIN rejected. Please enter the PIN again.');
        return;
      }
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatDateTime = (date) => new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));

  if (!adminPin) {
    return <AdminPinGate error={authError} onSubmit={handlePinSubmit} />;
  }

  return (
    <main className="admin-page min-vh-100">
      <header className="admin-topbar border-bottom border-secondary">
        <div className="container py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <a href="/" className="text-decoration-none fs-3 fw-black fst-italic text-brand-yellow font-heading">
              JOHNNY<span className="text-brand-red">&</span>JUGNU
            </a>
            <h1 className="font-heading text-uppercase mt-3 mb-1">Active Orders</h1>
            <p className="text-white-50 mb-0">Live kitchen queue for pending, confirmed, preparing, and ready orders.</p>
          </div>
          <button
            type="button"
            onClick={fetchActiveOrders}
            className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'admin-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-warning"
          >
            Lock
          </button>
        </div>
      </header>

      <section className="container py-4 py-lg-5">
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="admin-stat">
              <span className="text-white-50 small text-uppercase">Active</span>
              <strong>{orders.length}</strong>
            </div>
          </div>
          {['pending', 'preparing', 'ready'].map((status) => (
            <div className="col-sm-6 col-lg-3" key={status}>
              <div className="admin-stat">
                <span className="text-white-50 small text-uppercase">{status}</span>
                <strong>{orders.filter((order) => order.orderStatus === status).length}</strong>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="admin-empty glass-card">
            <RefreshCw className="admin-spin text-brand-yellow" size={34} />
            <p className="mb-0">Loading active orders...</p>
          </div>
        ) : error ? (
          <div className="admin-empty glass-card">
            <p className="text-danger mb-3">{error}</p>
            <button className="btn bg-brand-red text-white" onClick={fetchActiveOrders}>Try Again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty glass-card">
            <ClipboardList className="text-brand-yellow" size={38} />
            <h2 className="font-heading mb-1">No Active Orders</h2>
            <p className="text-white-50 mb-0">New orders will appear here automatically when you refresh.</p>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => (
              <div className="col-12 col-xl-6" key={order._id}>
                <article className="admin-order glass-panel">
                  <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className={`admin-status admin-status-${order.orderStatus}`}>{order.orderStatus}</span>
                        <span className="text-white-50 small">{formatDateTime(order.createdAt)}</span>
                      </div>
                      <h2 className="font-heading mb-0">#{order.orderNumber}</h2>
                    </div>
                    <div className="text-sm-end">
                      <span className="d-block text-white-50 small">Total</span>
                      <strong className="fs-4 text-brand-yellow">Rs. {Math.round(order.total)}</strong>
                    </div>
                  </div>

                  <div className="admin-customer mb-3">
                    <span><ClipboardList size={16} /> {order.customerInfo?.name}</span>
                    <span><Phone size={16} /> {order.customerInfo?.phone}</span>
                    <span><Mail size={16} /> {order.customerInfo?.email}</span>
                    <span>
                      {order.orderType === 'delivery' ? <Truck size={16} /> : <Store size={16} />}
                      {order.orderType}
                    </span>
                  </div>

                  {order.customerInfo?.address && (
                    <p className="admin-note mb-3">{order.customerInfo.address}</p>
                  )}

                  <div className="admin-items mb-3">
                    {order.items.map((item) => (
                      <div className="admin-item" key={`${order._id}-${item._id || item.name}`}>
                        <span>{item.quantity} x {item.name}</span>
                        <strong>Rs. {item.price * item.quantity}</strong>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <p className="admin-note mb-3">{order.specialInstructions}</p>
                  )}

                  <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
                    <label className="text-white-50 small text-uppercase" htmlFor={`status-${order.orderNumber}`}>Status</label>
                    <select
                      id={`status-${order.orderNumber}`}
                      className="form-select admin-select"
                      value={order.orderStatus}
                      disabled={updatingOrder === order.orderNumber}
                      onChange={(event) => handleStatusChange(order.orderNumber, event.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option value={status} key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StorefrontApp() {
  const adminTapRef = useRef({ count: 0, timer: null });
  const toastTimerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // API data states
  const [menuItems, setMenuItems] = useState([]);
  const [dealsData, setDealsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order form states
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    orderType: 'pickup',
    paymentMethod: 'cash',
    specialInstructions: ''
  });
  const [orderLoading, setOrderLoading] = useState(false);

  // Contact form states
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const tapState = adminTapRef.current;
    return () => {
      window.clearTimeout(tapState.timer);
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleBrandClick = () => {
    window.clearTimeout(adminTapRef.current.timer);
    adminTapRef.current.count += 1;

    if (adminTapRef.current.count >= 5) {
      window.location.href = '/admin';
      return;
    }

    adminTapRef.current.timer = window.setTimeout(() => {
      adminTapRef.current.count = 0;
    }, 2500);
  };

  // Fetch menu data on component mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menuResponse, categoriesResponse] = await Promise.all([
          menuAPI.getMenu(),
          menuAPI.getCategories()
        ]);

        setMenuItems(menuResponse.data.data.menuItems);
        setDealsData(menuResponse.data.data.deals);
        setCategories(['All', ...categoriesResponse.data.data]);

      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const addToCart = (item) => setCart([...cart, item]);
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const showToast = (type, title, message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast({ type, title, message });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4200);
  };

  const filteredMenu = menuItems.filter(item => 
    (activeCategory === "All" || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle order submission
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setOrderLoading(true);
    try {
      const orderData = {
        customerInfo: {
          name: orderForm.customerName,
          email: orderForm.customerEmail,
          phone: orderForm.customerPhone,
          address: orderForm.orderType === 'delivery' ? orderForm.customerAddress : undefined
        },
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        })),
        orderType: orderForm.orderType,
        paymentMethod: orderForm.paymentMethod,
        specialInstructions: orderForm.specialInstructions
      };

      const response = await orderAPI.createOrder(orderData);
      showToast(
        'success',
        'Order placed!',
        response.data.message || 'Your food is being prepared. We will contact you shortly.'
      );
      setCart([]); // Clear cart after successful order
      setCartOpen(false); // Close cart sidebar

    } catch (err) {
      console.error('Order submission failed:', err);
      showToast('error', 'Order failed', 'Please check your details and try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);

    try {
      await contactAPI.submitContact(contactForm);
      setContactSuccess('Thank you for your message! We\'ll get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact submission failed:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`order-toast order-toast-${toast.type}`}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            role="status"
            aria-live="polite"
          >
            <span className="order-toast-icon">
              {toast.type === 'success' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </span>
            <span>
              <span className="order-toast-title">{toast.title}</span>
              <span className="order-toast-message">{toast.message}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className={`fixed-top w-100 transition-all ${isScrolled ? 'nav-scrolled py-2' : 'py-4'}`} style={{ zIndex: 1000, transition: '0.3s' }}>
        <div className="container d-flex justify-content-between align-items-center">
          <button
            type="button"
            onClick={handleBrandClick}
            className="btn p-0 border-0 d-flex align-items-center"
            aria-label="Johnny and Jugnu home"
          >
            <img src={brandImage} alt="Johnny and Jugnu" className="navbar-brand-image" />
          </button>
          
          <div className="d-none d-md-flex gap-4 fw-bold">
            {['Home', 'Menu', 'Deals', 'Contact'].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-decoration-none text-white text-opacity-75 text-hover-white text-uppercase">
                {link}
              </a>
            ))}
          </div>

          <button onClick={() => setCartOpen(true)} className="btn text-white position-relative border-0 p-2">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-brand-red">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* CART SIDEBAR */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setCartOpen(false)} 
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1040, backdropFilter: 'blur(4px)' }} 
            />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              className="p-4 d-flex flex-column"
              style={{ position: 'fixed', top: 0, right: 0, width: '320px', height: '100%', backgroundColor: '#111', zIndex: 1050, boxShadow: '-10px 0 30px rgba(225,29,72,0.2)' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                <h3 className="mb-0 font-heading">Your Order</h3>
                <button className="btn text-white border-0 p-0" onClick={() => setCartOpen(false)}><X /></button>
              </div>
              <div className="flex-grow-1 overflow-auto">
                {cart.length === 0 ? <p className="text-muted text-center mt-5">Your cart is empty.</p> : 
                  cart.map((item, idx) => (
                    <div key={idx} className="glass-card p-3 mb-2 rounded-3">
                      <p className="mb-1 fw-bold">{item.name}</p>
                      <p className="mb-0 text-brand-yellow small">Rs. {item.price}</p>
                    </div>
                  ))
                }
              </div>
              <div className="border-top border-secondary pt-4 mt-auto">
                {cart.length > 0 && (
                  <form onSubmit={handleOrderSubmit} className="mb-3">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Your Name"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                        required
                      />
                      <input
                        type="email"
                        className="form-control mb-2"
                        placeholder="Email"
                        value={orderForm.customerEmail}
                        onChange={(e) => setOrderForm({...orderForm, customerEmail: e.target.value})}
                        required
                      />
                      <input
                        type="tel"
                        className="form-control mb-2"
                        placeholder="Phone"
                        value={orderForm.customerPhone}
                        onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                        required
                      />
                      {orderForm.orderType === 'delivery' && (
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Delivery Address"
                          value={orderForm.customerAddress}
                          onChange={(e) => setOrderForm({...orderForm, customerAddress: e.target.value})}
                          required
                        />
                      )}
                      <select
                        className="form-control mb-2"
                        value={orderForm.orderType}
                        onChange={(e) => setOrderForm({...orderForm, orderType: e.target.value})}
                      >
                        <option value="pickup">Pickup</option>
                        <option value="delivery">Delivery</option>
                      </select>
                      <select
                        className="form-control mb-2"
                        value={orderForm.paymentMethod}
                        onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                      </select>
                      <textarea
                        className="form-control mb-2"
                        placeholder="Special instructions (optional)"
                        value={orderForm.specialInstructions}
                        onChange={(e) => setOrderForm({...orderForm, specialInstructions: e.target.value})}
                        rows="2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn bg-brand-red text-white w-100 py-2 fw-bold neon-box-red rounded-3 font-heading fs-5 mb-2"
                      disabled={orderLoading}
                    >
                      {orderLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </form>
                )}
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Total:</span><span className="text-brand-red">Rs. {cartTotal}</span>
                </div>
                <button
                  onClick={() => setCart([])}
                  className="btn btn-outline-secondary w-100 py-2 fw-bold rounded-3 font-heading fs-6"
                >
                  Clear Cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3D FLOATING HERO SECTION */}
      <section id="home" className="min-vh-100 position-relative d-flex flex-column align-items-center justify-content-center text-center overflow-hidden pt-5">
        
        {/* Glow Effects */}
        <div className="position-absolute rounded-circle bg-brand-red" style={{ width: '400px', height: '400px', top: '20%', left: '10%', filter: 'blur(150px)', opacity: 0.2, zIndex: 0 }}></div>
        <div className="position-absolute rounded-circle bg-brand-yellow" style={{ width: '400px', height: '400px', bottom: '10%', right: '10%', filter: 'blur(150px)', opacity: 0.2, zIndex: 0 }}></div>

        {/* Text Content */}
        <div className="container position-relative mt-5" style={{ zIndex: 3 }}>
          <motion.h1 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
            className="font-heading text-uppercase mb-3 neon-text-red" 
            style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', color: 'var(--brand-yellow)', lineHeight: 0.85 }}
          >
            SMASH YOUR<br/>HUNGER!
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="lead text-white-50 mb-5 mx-auto fs-5" style={{ maxWidth: '650px' }}
          >
            Premium smash burgers, loaded fries, and absolute chaos in every bite. Serving fresh in Johar Town, Lahore.
          </motion.p>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} 
            className="d-flex justify-content-center"
          >
            <a href="#menu" className="btn bg-brand-red text-white rounded-pill px-5 py-3 font-heading fs-4 neon-box-red text-uppercase shadow-lg d-flex align-items-center gap-2">
              ORDER NOW <ShoppingCart size={24}/>
            </a>
          </motion.div>
        </div>

        {/* 3D Floating Burger */}
        <motion.div 
          initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 50, delay: 0.5 }}
          className="position-relative mt-4" style={{ zIndex: 2 }}
        >
        </motion.div>
      </section>

      {/* MENU SECTION WITH PREMIUM HOVER CARDS */}
      <section id="menu" className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-black fst-italic text-uppercase mb-2 font-heading" style={{ fontWeight: 900 }}>Our <span className="text-brand-yellow">Menu</span></h2>
            <p className="text-white-50">Handcrafted daily with 100% premium ingredients.</p>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
            <div className="d-flex gap-2 overflow-auto w-100 scrollbar-hide pb-2">
              {loading ? (
                <div className="text-white-50">Loading categories...</div>
              ) : (
                categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`btn rounded-pill px-4 fw-bold ${activeCategory === cat ? 'bg-brand-yellow text-dark' : 'btn-outline-light'}`}>
                    {cat}
                  </button>
                ))
              )}
            </div>
            <div className="position-relative w-100" style={{ maxWidth: '300px' }}>
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" size={18} />
              <input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control premium-input bg-transparent text-white border-secondary rounded-pill ps-5 py-2 glass-card" />
            </div>
          </div>

         <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="text-white-50 fs-4">Loading menu...</div>
              </div>
            ) : error ? (
              <div className="col-12 text-center py-5">
                <div className="text-danger fs-4">{error}</div>
                <button className="btn btn-outline-light mt-3" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {filteredMenu.map((item, index) => (
                <motion.div 
                  key={item.id} layout 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.1 }}
                  className="col-12 col-md-6 col-lg-4"
                >
                  <div className="glass-panel p-3 h-100 food-card d-flex flex-column">
                    
                    {/* Rating Badge */}
                    <div className="position-absolute top-0 end-0 m-4 z-2 bg-dark bg-opacity-75 backdrop-blur rounded-pill px-2 py-1 d-flex align-items-center gap-1 fw-bold text-brand-yellow small shadow">
                      <Star size={12} fill="currentColor"/> {item.rating}
                    </div>
                    
                    {/* Image Container */}
                    <div className="img-container mb-3" style={{ height: '240px' }}>
                      <img src={item.img} className="w-100 h-100 object-fit-cover" alt={item.name} />
                    </div>
                    
                    {/* Text & Button Container */}
                    <div className="mt-auto d-flex flex-column flex-grow-1">
                      <p className="text-brand-yellow small fw-bold mb-1 text-uppercase letter-spacing-1">{item.category}</p>
                      
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <h4 className="font-heading mb-0 fs-3 lh-1 pe-2">{item.name}</h4>
                        <span className="fs-5 fw-bold text-white">Rs.{item.price}</span>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(item)} 
                        className="cart-btn btn w-100 mt-auto py-3 rounded-pill fw-bold border border-secondary text-white d-flex justify-content-center align-items-center gap-2"
                      >
                        ADD TO ORDER <ShoppingCart size={18} />
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>)}
          </div>
        </div>
      </section>

      {/* FIXED DEALS SECTION */}
      <section id="deals" className="py-5" style={{ backgroundColor: '#111', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
        <div className="container py-5">
          <div className="row mb-5 align-items-end">
            <div className="col-md-8">
              <h2 className="display-4 fw-black fst-italic text-uppercase text-brand-red mb-2 font-heading" style={{ fontWeight: 900 }}>Flash Deals</h2>
              <p className="text-white-50 mb-0">Grab these combos before the time runs out!</p>
            </div>
            <div className="col-md-4 mt-4 mt-md-0 d-flex justify-content-md-end gap-2 text-center">
              {['Hours', 'Mins', 'Secs'].map(unit => (
                <div key={unit} className="glass-card p-2 rounded-3 min-w" style={{ minWidth: '70px' }}>
                  <div className="fs-4 fw-bold text-brand-yellow">12</div>
                  <div className="small text-white-50">{unit}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-4">
            {dealsData.map((deal) => (
              <div key={deal.id} className="col-lg-6">
                <div className="glass-card p-4 rounded-4 position-relative overflow-hidden d-flex flex-column flex-sm-row gap-4 align-items-center h-100">
                  <span className="badge bg-brand-red position-absolute top-0 start-0 m-3 z-1">SAVE 20%</span>
                  
                  {/* Fixed Image Loading Here */}
                  <div style={{ width: '150px', height: '150px', flexShrink: 0 }}>
                    <img 
                      src={deal.img} 
                      alt={deal.name} 
                      className="rounded-3 w-100 h-100 object-fit-cover shadow" 
                    />
                  </div>
                  
                  <div className="d-flex flex-column h-100 justify-content-center w-100">
                    <h4 className="fw-bold font-heading fs-3">{deal.name}</h4>
                    <p className="text-white-50 small mb-3">{deal.desc}</p>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <span className="fs-4 fw-bold text-brand-yellow">Rs. {deal.newPrice}</span>
                      <span className="text-white-50 text-decoration-line-through small">Rs. {deal.oldPrice}</span>
                    </div>
                    <button className="btn bg-brand-red text-white fw-bold neon-box-red rounded-3 mt-auto align-self-start">Grab Deal</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT/FOOTER SECTION */}
      <section id="contact" className="py-5 my-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-black fst-italic text-uppercase mb-4 font-heading" style={{ fontWeight: 900 }}>Hit Us <span className="text-brand-yellow">Up</span></h2>
              {contactSuccess && (
                <div className="alert alert-success mb-3">{contactSuccess}</div>
              )}
              <form onSubmit={handleContactSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6"><input type="text" className="form-control premium-input bg-transparent text-white border-secondary glass-card py-3 rounded-3" placeholder="Name" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required /></div>
                  <div className="col-sm-6"><input type="email" className="form-control premium-input bg-transparent text-white border-secondary glass-card py-3 rounded-3" placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required /></div>
                </div>
                <textarea className="form-control premium-input bg-transparent text-white border-secondary glass-card mb-4 rounded-3" rows="4" placeholder="Message" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} required></textarea>
                <button className="btn bg-brand-red text-white px-5 py-3 fw-bold neon-box-red rounded-3 font-heading fs-5" disabled={contactLoading}>
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            <div className="col-lg-6">
              <div className="glass-card p-5 rounded-4 d-flex flex-column gap-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="d-flex gap-3 align-items-start">
                  <div className="bg-brand-yellow text-dark p-3 rounded-circle"><MapPin /></div>
                  <div><h5 className="fw-bold mb-1">Location</h5><p className="text-white-50 mb-0">Phase 2, Johar Town, Lahore</p></div>
                </div>
                <div className="d-flex gap-3 align-items-start">
                  <div className="bg-brand-red text-white p-3 rounded-circle"><Clock /></div>
                  <div><h5 className="fw-bold mb-1">Hours</h5><p className="text-white-50 mb-0">Mon-Sun: 12:00 PM - 3:00 AM</p></div>
                </div>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-contact-link text-decoration-none"
                  aria-label="Chat with Johnny and Jugnu on WhatsApp"
                >
                  <span className="whatsapp-contact-icon"><WhatsAppIcon /></span>
                  <span>
                    <span className="d-block fw-bold text-white">WhatsApp</span>
                    <span className="d-block text-white-50">Chat with us instantly</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-float"
        aria-label="Chat with Johnny and Jugnu on WhatsApp"
      >
        <WhatsAppIcon size={30} />
      </a>

      <footer className="py-4 border-top border-secondary text-center" style={{ backgroundColor: '#050505' }}>
        <button
          type="button"
          onClick={handleBrandClick}
          className="btn p-0 border-0 fs-3 fw-black fst-italic text-brand-yellow mb-2 font-heading"
          style={{ fontWeight: 900 }}
          aria-label="Johnny and Jugnu home"
        >
          JOHNNY<span className="text-brand-red">&</span>JUGNU
        </button>
        <p className="text-white-50 small mb-0">© {new Date().getFullYear()} Johnny & Jugnu Johar Town.</p>
      </footer>
Built
    </div>
  );
}

export default function App() {
  const isAdminPage = window.location.pathname.toLowerCase().startsWith('/admin');
  return isAdminPage ? <AdminOrdersPage /> : <StorefrontApp />;
}
