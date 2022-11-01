import { gql } from '@apollo/client';

export const QUERY_PRODUCTS = gql`
  query getProducts($category: ID) {
    products(category: $category) {
      _id
      name
      description
      price
      quantity
      image
      category {
        _id
      }
    }
  }
`;

export const QUERY_CHECKOUT = gql`
  query getCheckout($products: [LineItem]!) {
    checkout(products: $products) {
      session
    }
  }
`;

export const QUERY_ALL_PRODUCTS = gql`
  {
    products {
      _id
      name
      description
      price
      quantity
      category {
        name
      }
    }
  }
`;

export const QUERY_CATEGORIES = gql`
  {
    categories {
      _id
      name
    }
  }
`;

export const QUERY_USER = gql`
  {
    user {
      firstName
      lastName
      orders {
        _id
        purchaseDate
        products {
          _id
          name
          description
          price
          quantity
          image
        }
      }
    }
  }
`;

export const QUERY_USER_ORDER_HISTORY = gql`
  query UserOrderHistory {
    userOrderHistory {
      _id
      firstName
      lastName
      email
      orders {
        _id
        purchaseDate
        products {
          prodId {
            _id
            name
            description
            image
            quantity
            price
            category {
              _id
              name
            }
          }
          qnty
        }
      }
    }
  }
`;

export const QUERY_RESCUES = gql`
query getRescues {
  rescues {
    _id
    name
    website
    amountOwed
  }
}
`;


