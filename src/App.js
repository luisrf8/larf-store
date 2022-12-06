import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Header from "./routes/landing/Header.js";
import Footer from './components/footer/Footer';
import { About, Blog, Cart, Checkout, Contact, RootSection, Menu, PasswordRecovery, Payment, Register, SingleItem } from './routes/index'
import { allProductsData } from "./data/AllProductsData.js";
import { AllCategories } from "./data/AllCategories";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      allCategories: [],
      activeCategory: "Menu",
      cartItems: [],
      clearedCart: false,
      allProducts: [],
      productsQuantity: 0,
      totalPayment: 0,
      taxes: 0,
      formValue: { email: '', password: '' },
      formError: {},
      submit: false,
      validLogin: false,
    };
    this.getProductsByCategory = this.getProductsByCategory.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.handleAddProduct = this.handleAddProduct.bind(this);
    this.handleRemoveProduct = this.handleRemoveProduct.bind(this);
    this.clearCart = this.clearCart.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.removeNavigationMenu = this.removeNavigationMenu.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }


  // GET DATA
  /*******************************************************/
  allCategoriesData = new Promise((resolve, reject) => {
    if (true) {
      resolve(AllCategories);
      return;
    }
    reject("error, check the code!");
  });
  allProductsData = new Promise((resolve, reject) => {
    if (true) {
      resolve(allProductsData);
      return;
    }
    reject("error, check the code!");
  });

  getCategories = async () => {
    try {
      const result = await this.allCategoriesData;
      this.setState({ allCategories: result });
    } catch (error) {
      console.log(error);
    }
  };

  getAllProducts = async () => {
    try {
      const result = await this.allProductsData;
      this.setState({ allProducts: result });;
    } catch (error) {
      console.log(error);
    }
  };

  // HANDLE CHANGE
  /*******************************************************/
  changeCategory = async (newCategory) => {
    this.setState({ activeCategory: newCategory });
    this.getProductsByCategory(newCategory);
  };

  getProductsByCategory = async (category) => {
    let separateCategoriesByname = [];
    //Separate arrays by category names
    const separateCategories = allProductsData.reduce(function (
      singleCategory,
      singleItem
    ) {
      separateCategoriesByname = Object.keys(singleCategory);

      if (!singleCategory[singleItem.Category])
        singleCategory[singleItem.Category] = singleItem;
      else
        singleCategory[singleItem.Category] = Array.isArray(
          singleCategory[singleItem.Category]
        )
          ? singleCategory[singleItem.Category].concat(singleItem)
          : [singleCategory[singleItem.Category]].concat(singleItem);
      return singleCategory;
    },
      {});

    const result = Object.keys(separateCategories).map(
      (e) => separateCategories[e]
    );

    let singleCategoryArray = [];
    result.map((categories) => {
      return singleCategoryArray.push(categories);
    });
    //Change products by category
    separateCategoriesByname.forEach((cate) => {
      if (cate === category) {
        return this.setState({ allProducts: separateCategories[category] });
      }
      if (category === "Menu") {
        return this.setState({ allProducts: allProductsData });
      }
    });
  };
  // CART LOGIC
  /*******************************************************/
  CheckRepeatableProducts = (
    cartItems,
    targetProduct,
    userSelectedAttributes
  ) => {
    let item;
    let productsById = cartItems.filter((item) => item.id === targetProduct.id);
    productsById.forEach((targetProduct) => {
      if (this.MatchingAttributes(userSelectedAttributes, targetProduct)) {
        item = targetProduct;
      }
    });
    return item;
  };
  MatchingAttributes = (userSelectedAttributes, targetProduct) => {
    const attributesMatch = (groupOne, groupTwo) => {
      return Object.values(groupOne)[1] === Object.values(groupTwo)[1];
    };

    let truthyValuesCounter = 0;
    let i = 0;
    while (i < userSelectedAttributes.length) {
      if (
        attributesMatch(
          userSelectedAttributes[i],
          targetProduct?.userSelectedAttributes[i]
        )
      ) {
        truthyValuesCounter += 1;
      }
      i += 1;
    }

    if (truthyValuesCounter === userSelectedAttributes?.length) {
      return true;
    }
  };
  updateCartQuantity(
    actionToPerfrom,
    productAlreadyInCart,
    userSelectedAttributes
  ) {
    const repeatableProduct = this.CheckRepeatableProducts(
      this.state.cartItems,
      productAlreadyInCart,
      userSelectedAttributes
    );
    //Find the target product to update by index
    const indexOfRepeatableProduct =
      this.state.cartItems.indexOf(repeatableProduct);
    const currentProductList = [...this.state.cartItems];
    //Check type of action
    if (actionToPerfrom === "addProduct") {
      currentProductList[indexOfRepeatableProduct].quantity += 1;
    } else {
      currentProductList[indexOfRepeatableProduct].quantity -= 1;
    }

    return currentProductList;
  }
  handleAddProduct = (targetProduct, userSelectedAttributes) => {
    let updatedProductList;
    const productAlreadyInCart = this.CheckRepeatableProducts(
      this.state.cartItems,
      targetProduct,
      userSelectedAttributes
    );

    if (productAlreadyInCart) {
      updatedProductList = this.updateCartQuantity(
        "addProduct",
        productAlreadyInCart,
        userSelectedAttributes
      );
    } else {
      let modifiedProduct = JSON.parse(JSON.stringify(targetProduct));
      let clone;

      for (let i = 0; i < targetProduct?.attributes?.length; i++) {
        for (let j = 0; j < targetProduct?.attributes[i]?.items?.length; j++) {
          if (
            targetProduct.attributes[i].items[j].value ===
            userSelectedAttributes[i].value
          ) {
            clone = {
              ...targetProduct.attributes[i].items[j],
            };
            clone.isSelected = true;

            modifiedProduct.attributes[i].items[j].isSelected = true;

            modifiedProduct.attributes[i].items[j] = {
              ...clone,
            };
          }
        }
      }

      updatedProductList = [
        ...this.state.cartItems,
        {
          ...modifiedProduct,
          userSelectedAttributes,
          quantity: 1,
        },
      ];
    }

    this.setState({ cartItems: updatedProductList });
    //Update cart amount
    if (updatedProductList.length <= 1) {
      updatedProductList.map((item) => {
        return this.setState({ productsQuantity: item.quantity });
      });
    } else {
      let productListArray = updatedProductList.map((item) => item.quantity);
      let sum = productListArray.reduce((a, b) => a + b, 0);
      this.setState({ productsQuantity: sum });
    }
  };
  // Remove Product From Cart
  handleRemoveProduct = (targetProduct, userSelectedAttributes) => {
    let updatedProductList;
    let repeatableProduct = this.CheckRepeatableProducts(
      this.state.cartItems,
      targetProduct,
      userSelectedAttributes
    );
    if (repeatableProduct.quantity > 1) {
      updatedProductList = this.updateCartQuantity(
        "removeProduct",
        repeatableProduct,
        userSelectedAttributes
      );
    } else {
      const products = [...this.state.cartItems];
      const indexOfProduct = products.indexOf(repeatableProduct);
      products.splice(indexOfProduct, 1);
      updatedProductList = products;
    }
    this.setState({ cartItems: updatedProductList });

    //Update cart amount
    if (updatedProductList.length <= 1) {
      updatedProductList.map((item) => {
        return this.setState({ productsQuantity: item.quantity });
      });
    } else {
      let productListArray = updatedProductList.map((item) => item.quantity);
      let sum = productListArray.reduce((a, b) => a + b);
      this.setState({ productsQuantity: sum });
    }
    if (updatedProductList.length === 0) {
      this.setState({ productsQuantity: 0 });
    }
  };

  clearCart() {
    this.setState({ cartItems: [] });
    this.setState({ clearedCart: true });
  }

  getTotalPrice = (cartItems) => {
    let totalPayment = 0;
    cartItems.map((item) => {
      const correctPrice = item.ItemPrice;
      return (totalPayment = totalPayment + correctPrice * item.quantity);
    });
    for (let item of cartItems) {
      const correctPrice = item.ItemPrice;
      totalPayment = totalPayment + correctPrice * item.quantity;
    }
    totalPayment = parseFloat(totalPayment.toFixed(2));

    this.setState({ totalPayment: totalPayment });
    this.setState({ taxes: ((totalPayment * 10) / 100).toFixed(2) });
  };

  successMsg() {
    const alertMessage = document.querySelector(".success-msg");
    alertMessage.classList.add("visible");
    setTimeout(() => {
      alertMessage.classList.remove("visible");
    }, 1000);
  }

  // ! MODAL TOGGLE

  // HideModal() {
  //   const hiddenModal = document.querySelector(".modal");
  //   hiddenModal.classList.remove("active-modal");
  // }
  showModal() {
    const hiddenModal = document.querySelector(".modal");
    hiddenModal.classList.toggle("active-modal");
    console.log(hiddenModal.classList);
  }
  showHiddenMenu() {
    const hiddenMenu = document.querySelector(".navigation-menu");
    hiddenMenu.classList.toggle("active");
  }
  removeNavigationMenu() {
    const hiddenMenu = document.querySelector(".navigation-menu");
    hiddenMenu.classList.remove("active");
  }

  // ! LOGIN MODAL Validation
  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.formValue.password === '12345678' && this.state.formValue.email === 'danielw@pizzatime.com') {
      this.setState({ validLogin: true });
    }
    this.setState({ formError: this.validateForm(this.state.formValue) })
    this.setState({ submit: true });
    this.removeNavigationMenu();
  }

  handleValidation = (e) => {
    const { name, value } = e.target;
    this.setState({ formValue: { ...this.state.formValue, [name]: value } })
  }

  handleLogout = () => this.setState({ validLogin: false });

  validateForm = (value) => {
    let errors = {}
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!value.email) {
      errors.email = "Please enter email"
    }
    else if (!emailRegex.test(value.email)) {
      errors.email = "Please enter valid email"
    }
    if (!value.password || value.password.length < 8) {
      errors.password = "Please enter a valid password"
    }
    return errors;
  }

  hideModal() {
    const hiddenModal = document.querySelector(".modal");
    hiddenModal.classList.remove("active-modal");
    this.setState({ formValue: { email: '', password: '' } });
    this.setState({ formError: {} });
    this.setState({ submit: false });
  }

  removeMenu() {
    const hiddenMenu = document.querySelector(".menu");
    hiddenMenu.classList.remove("active");
  }


  //! Other
  componentDidMount() {
    this.getCategories();
    this.getAllProducts();
    this.getProductsByCategory(this.state.activeCategory);
    this.getTotalPrice(this.state.cartItems);

  }

  shouldComponentUpdate(nextProps, nextState) {
    const { cartItems, clearedCart, validLogin, itemOffset, endOffset } = this.state;
    if (cartItems !== nextState.cartItems) {
      this.getTotalPrice(nextState.cartItems);
    }
    if (clearedCart !== nextState.clearedCart) {
      this.clearCart();
    }
    if (validLogin !== nextState.validLogin) {
      this.hideModal();
    }


    return true;
  }
  render() {
    return (
      <BrowserRouter>
        <Header
          showModal={this.showModal}
          showHiddenMenu={this.showHiddenMenu}
          removeMenu={this.removeMenu}
          // HideModal={this.HideModal}

          handleLogout={this.handleLogout}
          validLogin={this.state.validLogin}
          formValue={this.state.formValue}
          handleSubmit={this.handleSubmit}
          submit={this.state.submit}
          formError={this.state.formError}
          hideModal={this.hideModal}
          removeNavigationMenu={this.removeNavigationMenu}
          handleValidation={this.handleValidation}
          productsQuantity={this.state.productsQuantity}
        />
        <Routes>
          <Route
            path="/"
            element={<RootSection />}
          />
          <Route
            path="/menu"
            element={
              <Menu
                allProducts={this.state.allProducts}
                allCategories={this.state.allCategories}
                changeCategory={this.changeCategory}
                handleAddProduct={this.handleAddProduct}
                handleRemoveProduct={this.handleRemoveProduct}
                successMsg={this.successMsg}
                activeCategory={this.state.activeCategory}


                pageCountExpenses={this.state.pageCountExpenses}
                handlePageClick={this.handlePageClick}
                currentExpenses={this.state.currentExpenses}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                handleLogout={this.handleLogout}
                // validLogin={this.state.validLogin}
                formValue={this.state.formValue}
                handleSubmit={this.handleSubmit}
                submit={this.state.submit}
                formError={this.state.formError}
                hideModal={this.hideModal}
                removeMenu={this.removeMenu}
                handleValidation={this.handleValidation}
                // productsQuantity={this.state.productsQuantity}
                showModal={this.showModal}





                validLogin={this.state.validLogin}
                totalPayment={this.state.totalPayment}
                cartItems={this.state.cartItems}
                productsQuantity={this.state.productsQuantity}
                handleAddProduct={this.handleAddProduct}
                handleRemoveProduct={this.handleRemoveProduct}
                successMsg={this.successMsg}
                getTotalPrice={this.getTotalPrice}
                taxes={this.state.taxes}
                clearCart={this.clearCart}
                clearedCart={this.state.clearedCart}
              />
            }
          />
          <Route
            path="/:id"
            element={
              <SingleItem
                handleAddProduct={this.handleAddProduct}
                handleRemoveProduct={this.handleRemoveProduct}
                successMsg={this.successMsg}
              />
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/checkout"
            element={
              <Checkout
                totalPayment={this.state.totalPayment}
                cartItems={this.state.cartItems}
                productsQuantity={this.state.productsQuantity}
                handleAddProduct={this.handleAddProduct}
                handleRemoveProduct={this.handleRemoveProduct}
                successMsg={this.successMsg}
                getTotalPrice={this.getTotalPrice}
                taxes={this.state.taxes}
              />
            }
          />
          <Route
            path="/payment"
            element={<Payment cartItems={this.state.cartItems} totalPayment={this.state.totalPayment} />}
          />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    );
  }
}
