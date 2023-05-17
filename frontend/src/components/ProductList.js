import React, {useState} from 'react'
import ProductItem from "./ProductItem";
import withContext from "../withContext";


const ProductList = props => {
  
  const [searchInput, setSearchInput] = useState("");

  const { products } = props.context;

  let productList = products;

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };
  
  if ( productList && productList.length && searchInput.length > 0) 
  {
    console.log (productList);

    
    productList = productList.filter((product) => {
      
        let result= product.name.match(searchInput);
        if (searchInput==="chunky"){console.log (result)}
        return result; 
  });
  console.log(productList);
  }

  

  return (
    <>
      <div className="hero is-primary">
      <input
   type="text"
   placeholder="Search here"
   onChange={handleChange}
   value={searchInput} />

        <div className="hero-body container">
          <h4 className="title">Nuestros Productos</h4>
        </div>
      </div>
      <br />
      <div className="container">
        <div className="column columns is-multiline">
          {productList && productList.length ? (
            productList.map((product, index) => (
              <ProductItem
                product={product}
                key={index}
                addToCart={props.context.addToCart}
              />
            ))
          ) : (
            <div className="column">
              <span className="title has-text-grey-light">
                ¡Productos no encontrados!
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withContext(ProductList);