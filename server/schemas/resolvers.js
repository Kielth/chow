const {AuthenticationError} = require('apollo-server-express');
const { User, Product, Category, Orders, Rescues, ItemLine } = require('../models');
// import models here
const {signToken} = require('../utils/auth') ;
//stripe sk secret key
const stripe = require('stripe')('sk_test_51LwBkjLpYjTk7wEvFpl951EqzObd5mknTrY3LSqm8Z2dFXIaNFlwVWh37dfY7oBdlbkY8HdSpUlBUE0cda2aaB3w009vlVwUhC');

const resolvers = {
  Query: {
    categories: async () => {
      return await Category.find();
    },
    checkout: async (parent, args, context) => {
      const url = new URL(context.headers.referer).origin; // https://localhost:3001 or new URL(context.headers.referer).origin;
      
      const line_items = [];
      const prodLines = [];
      
      for (let i = 0; i < args.products.length; i++) {
        let newLine = new ItemLine(args.products[i]);
        const {prodId} = await newLine.populate('prodId');
        prodId.quantity = args.products[i].qnty;
        prodLines.push(prodId);
      };   

      for (let i = 0; i < prodLines.length; i++) {
        // generate product id
        const product = await stripe.products.create({
          name: prodLines[i].name,
          description: prodLines[i].description,
          images: [`${url}/images/${prodLines[i].image}`]
        });

        // generate price id using the product id
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: prodLines[i].price * 100,
          currency: 'usd',
        });  
        // add price id to the line items array
        line_items.push({
          price: price.id,
          quantity: prodLines[i].quantity
        });
        
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`
      });
      
      return { session: session.id };
    },

    products: async (parent, { category, name }) => {
      const params = {};

      if (category) {
        params.category = category;
      }

      if (name) {
        params.name = {
          $regex: name
        };
      }

      return await Product.find(params).populate('category');
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate('category');
    },
    user: async (parent, args, context) => {
      if (context.user) { //context.user
        const user = await User.findById(context.user).populate({ //context.user
          path: 'orders.products',
          populate: 'prodId'
        });

        user.orders.sort((a, b) => b.purchaseDate - a.purchaseDate);

        return user;
      }

      throw new AuthenticationError('Not logged in');
    },
    order: async (parent, { _id }, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate({
          path: 'orders.products',
          populate: 'category'
        });

        return user.orders.id(_id);
      }
    
      throw new AuthenticationError('Not logged in');
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    addNewOrder: async (parent, {products}, context) => {
      const productsArray = [];
      products.forEach(item => {
        const newLine = new ItemLine(item);
        productsArray.push(newLine);
      });
      let order = new Orders();
      order.products = productsArray;
      // console.log(order.products);
      await User.findByIdAndUpdate(context.user._id, { $push: { orders: order } });
      return order;
    },

    addOrder: async (parent, { products }, context) => {
      if (context.user) {
        const order = new Orders({ products });

        await User.findByIdAndUpdate(context.user._id, { $push: { orders: order } });

        return order;
      }

      throw new AuthenticationError('Not logged in');
    },
    addRescue: async (parent, args) => {
      return await Rescues.create(args);
    },
    updateUser: async (parent, args, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, args, { new: true });
      }

      throw new AuthenticationError('Not logged in');
    },
    updateProduct: async (parent, { _id, quantity }) => {
      const decrement = Math.abs(quantity) * -1;

      return await Product.findByIdAndUpdate(_id, { $inc: { quantity: decrement } }, { new: true });
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    }
  }
};
      
module.exports = resolvers;