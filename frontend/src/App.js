import React, { Component } from "react";
import { Routes, Route, Link, BrowserRouter as Router } from "react-router-dom";

import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Login from './components/Login';
import ProductList from './components/ProductList';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

import Context from "./Context";
import Historia from "./components/Historia";
import Contacto from "./components/Contacto";
import Facturacion from "./components/Facturacion";
import Privacidad from "./components/Privacidad";



export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: []
    };
    this.routerRef = React.createRef();
  }

  addProduct = (product, callback) => {
    let products = this.state.products.slice();
    products.push(product);
    this.setState({ products }, () => callback && callback());
  };
  async componentDidMount() {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");
  
    const products = await axios.get('http://localhost:3001/products');
    user = user ? JSON.parse(user) : null;
    cart = cart? JSON.parse(cart) : {};
  
    this.setState({ user,  products: products.data, cart });
  }
  addToCart = cartItem => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };
  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };
  
  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({ cart });
  };
  checkout = () => {
    if (!this.state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }
  
    const cart = this.state.cart;
  
    const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;
  
        axios.put(
          `http://localhost:3001/products/${p.id}`,
          { ...p },
        )
      }
      return p;
    });
  
    this.setState({ products });
    this.clearCart();
  };

  login = async (email, password) => {
    const res = await axios.post(
      'http://localhost:3001/login',
      { email, password },
    ).catch((res) => {
      return { status: 401, message: 'Unauthorized' }
    })
  
    if(res.status === 200) {
      const { email } = jwt_decode(res.data.accessToken)
      const user = {
        email,
        token: res.data.accessToken,
        accessLevel: email === 'admin@example.com' ? 0 : 1
      }
  
      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  }
  
  logout = e => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout
        }}
      >
        <Router innerRef={this.routerRef}>
        <div className="App">
          <nav
            className="navbar container"
            role="navigation"
            aria-label="main navigation"
          >
            <div className="navbar-brand">
            <a className="navbar-item" href="#">
      <img src="../images/LOGOEMPRESA.png" width="200" height="500"/>
    </a>
              <b className="navbar-item is-size-4 ">Peanut House</b>
              <label
                role="button"
                className="navbar-burger burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showMenu: !this.state.showMenu });
                }}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </label>
            </div>
              <div className={`navbar-menu ${
                  this.state.showMenu ? "is-active" : ""
                }`}>
                <Link to="/products" className="navbar-item">
                  Productos
                </Link>
                {this.state.user && this.state.user.accessLevel < 1 && (
                  <Link to="/add-product" className="navbar-item">
                    Agregar Producto
                  </Link>
                )}
                <Link to="/cart" className="navbar-item">
                  Carrito
                  <span
                    className="tag is-primary"
                    style={{ marginLeft: "5px" }}
                  >
                    { Object.keys(this.state.cart).length }
                  </span>
                </Link>
                <Link to="/historia" className="navbar-item">
                  Historia
                </Link>
                <Link to="/contacto" className="navbar-item">
                  Contacto
                </Link>
                <Link to="/facturacion" className="navbar-item">
                  Facturación
                </Link>
                <Link to="/privacidad" className="navbar-item">
                  Privacidad
                </Link>


                {!this.state.user ? (
                  <Link to="/login" className="navbar-item">
                    Iniciar sesión
                  </Link>
                ) : (
                  <Link to="/" onClick={this.logout} className="navbar-item">
                    Cerrar sesión
                  </Link>
                )}
              </div>
            </nav>
            <Routes>
              <Route exact path="/" element={<ProductList/>} />
              <Route exact path="/login" element={<Login/>} />
              <Route exact path="/cart" element={<Cart/>} />
              <Route exact path="/add-product" element={<AddProduct/>} />
              <Route exact path="/products" element={<ProductList/>} />
              <Route exact path="/historia" element={<Historia/>} />
              <Route exact path="/contacto" element={<Contacto/>} />
              <Route exact path="/facturacion" element={<Facturacion/>} />
              <Route exact path="/privacidad" element={<Privacidad/>} />




            </Routes>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}