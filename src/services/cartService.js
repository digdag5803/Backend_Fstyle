import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import ProductService from "./ProductService.js";

export const CartService = {
  getCartOfUser: async (userId) => {
    try {
      const result = await Cart.findAll({
        where: { user_id: userId },
        include: [
          {
            model: CartItem,
            attributes: ["item_id", "quantity"],
            include: [
              {
                model: ProductDetail,
                attributes: [
                  "detail_id",
                  "product_id",
                  "color",
                  "size",
                  "stock",
                ],
                include: {
                  model: Product,
                  attributes: [
                    "product_name",
                    "product_description",
                    "product_price",
                    "category_id",
                    "thumbnail",
                  ],
                },
              },
            ],
          },
        ],
      });
      if (result.length > 0) return result;
      else {
        //add temp logic to create user's cart
        await CartService.createCart(userId);
        return await CartService.getCartOfUser(userId);
      }
    } catch (e) {
      throw e.message;
    }
  },
  getCartById: async (cartId) => {
    try {
      const cart = await Cart.findByPk(cartId, {
        include: [
          {
            model: CartItem,
            attributes: ["item_id", "quantity"],
            include: [
              {
                model: ProductDetail,
                attributes: [
                  "detail_id",
                  "product_id",
                  "color",
                  "size",
                  "stock",
                ],
                include: {
                  model: Product,
                  attributes: [
                    "product_name",
                    "product_description",
                    "product_price",
                    "category_id",
                    "thumbnail",
                  ],
                },
              },
            ],
          },
        ],
      });
      return cart;
    } catch (e) {
      throw e.message;
    }
  },
  createCart: async (userId) => {
    try {
      const cart = await Cart.create({
        user_id: userId,
      });
      return cart;
    } catch (e) {
      throw e.message;
    }
  },
  operateItemFromCart: async (cartId, productDetailId, quantity) => {
    try {
      const cartItem = await CartItem.findAll({
        where: {
          cart_id: cartId,
          product_detail_id: productDetailId,
        },
      });
      if (cartItem.length > 0) {
        //exist item in cart
        if (quantity === 0) {
          //remove item from cart
          await CartItem.destroy({
            where: {
              product_detail_id: productDetailId,
              cart_id: cartId,
            },
          });
          return {
            message: "delete cart item success",
            status: 0,
          };
        } else {
          //update item's quantity from cart
          if (await ProductService.canAddToCart(productDetailId, quantity)) {
            //can update item'quantity with quantity params
            await CartItem.update(
              {
                quantity: quantity,
              },
              {
                where: {
                  product_detail_id: productDetailId,
                  cart_id: cartId,
                },
              }
            );

            const itemIds = cartItem.map((item) => item.dataValues.item_id);
            return {
              data: itemIds,
              message: "update quantity of cart item successt",
              status: 1,
            };
          } else {
            //can not update item'quantity with quantity params
            return {
              message: "stock of product is not available",
              status: -1,
            };
          }
        }
      } else {
        //not exist item in cart
        if (quantity === 0) {
          //remove item not exist in cart
          return {
            message: "cannot remove item from cart",
            status: -2,
          };
        } else {
          //add item to cart
          if (await ProductService.canAddToCart(productDetailId, quantity)) {
            //can add item to cart
            await CartItem.create({
              cart_id: cartId,
              product_detail_id: productDetailId,
              quantity: quantity,
            });
            return {
              message: "add to cart success",
              status: 1,
            };
          } else {
            //can not add item to cart
            return {
              message: "stock of product is not available",
              status: -1,
            };
          }
        }
      }
    } catch (e) {
      throw e.message;
    }
  },
};
