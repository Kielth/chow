import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import Jumbotron from '../../components/shopping/Jumbotron';
import {ADD_NEW_ORDER } from '../../utils/shopping/mutations';
import { idbPromise } from '../../utils/helpers';

function Success() {
  //const [addOrder] = useMutation(ADD_ORDER);
  const [addNewOrder] = useMutation(ADD_NEW_ORDER);

  useEffect(() => {
    async function saveOrder() {
      const cart = await idbPromise('cart', 'get');
      const products = [];
      const thisRescue = await idbPromise('rescue', 'get');
      const rescue = thisRescue[thisRescue.length -1]._id;
      cart.forEach(item => {
        let newItem = {prodId: item._id, qnty: item.purchaseQuantity};
        products.push(newItem);
      })
        
      if (products.length) {
          const { data } = await addNewOrder({ variables: { products, rescue} });
         
          const productData = data.addNewOrder.products;

          productData.forEach((item) => {
              idbPromise('cart', 'delete', item.prodId);             
          });
        }

        const stateRescue = await idbPromise('rescue', 'get');
          
          if (stateRescue.length){
            stateRescue.forEach((rescue) => {
              idbPromise('rescue', 'delete', rescue);
            })
          }

      setTimeout(() => {
        window.location.assign('/');
      }, 300000);
    }

    saveOrder();
  }, [addNewOrder]);

  return (
    <div>
      <Jumbotron>
        <h1>Success!</h1>
        <h2>Thank you for your purchase!</h2>
        <h2>You will now be redirected to the home page</h2>
      </Jumbotron>
    </div>
  );
}

export default Success;
