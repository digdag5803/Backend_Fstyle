import pool from "../../config/Connection.js";
import QueryAddress from "../../Querydb/Addressdb.js";
import User from "../../models/User.js";

const AddressController = {
  index: async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const user = await User.findByPk(user_id, { attributes: ["address"] });
      const userAddress = user.dataValues.address;

      const [rows] = await pool.query(QueryAddress.getAddressbyUserId, [user_id]);

      if (rows.length === 0) {
        return res.status(200).send({ error: "Address not found" });
      }

      const data = rows.map((row) => ({
        id: row.address_id,
        recipient_name: row.recipient_name,
        street_address: row.street_address,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
        recipient_numberphone: row.recipient_numberphone,
        default: row.address_id === userAddress,
      }));

      res.status(200).json({ data, success: true });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Error fetching addresses" });
    }
  },

  getAddressDefault: async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const user = await User.findByPk(user_id, { attributes: ["address"] });
      const userAddress = user.dataValues.address;

      const [rows] = await pool.query(QueryAddress.getAddressDefault, [user_id, userAddress]);

      if (rows.length === 0) {
        return res.status(200).send({ status: -1, error: "Không tìm thấy địa chỉ mặc định" });
      }

      const data = rows.map((row) => ({
        id: row.address_id,
        recipient_name: row.recipient_name,
        street_address: row.street_address,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
        recipient_numberphone: row.recipient_numberphone,
        default: true,
      }));

      res.status(200).json({ data, success: true });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Error fetching default address" });
    }
  },

  create: async (req, res) => {
    const {
      recipient_name,
      street_address,
      city,
      state,
      postal_code,
      default_address,
      recipient_numberphone,
    } = req.body;

    const user_id = req.user.user_id;
    try {
      const [result] = await pool.query(QueryAddress.createAddress, [
        user_id,
        recipient_name,
        street_address,
        city,
        state,
        postal_code,
        recipient_numberphone,
      ]);

      const newAddressId = result.insertId;
      // mat khau
      if (default_address) {
        await User.update({ address: newAddressId }, { where: { user_id } });
      } else {
        await User.update({ address: null }, { where: { user_id } });
      }

      res.status(200).json({ success: true, message: "Thêm địa chỉ thành công" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Error creating address" });
    }
  },

  update: async (req, res) => {
    const {
      address_id,
      recipient_name,
      street_address,
      city,
      state,
      postal_code,
      default_address,
      recipient_numberphone,
    } = req.body;

    const user_id = req.user.user_id;
    try {
      const [rows] = await pool.query(QueryAddress.checkUserAddress, [user_id, address_id]);
      const addressCount = rows[0]?.count || 0;

      if (addressCount === 0) {
        return res.status(200).json({ success: false, message: "Address not found" });
      }

      if (default_address) {
        await User.update({ address: address_id }, { where: { user_id } });
      } else {
        await User.update({ address: null }, { where: { user_id } });
      }

      await pool.query(QueryAddress.updateAddress, [
        recipient_name,
        street_address,
        city,
        state,
        postal_code,
        recipient_numberphone,
        address_id,
        user_id,
      ]);

      res.status(200).json({ success: true, message: "Address updated" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Error updating address" });
    }
  },

  deleteAddress: async (req, res) => {
    const address_id = req.params.id;
    const user_id = req.user.user_id;
    try {
      const [rows] = await pool.query(QueryAddress.checkUserAddress, [user_id, address_id]);
      const addressCount = rows[0]?.count || 0;

      if (addressCount === 0) {
        return res.status(200).json({ success: false, message: "Address not found" });
      }

      await User.update({ address: null }, { where: { user_id } });

      await pool.query(QueryAddress.deleteAddress, [address_id, user_id]);

      res.status(200).json({ success: true, message: "Address deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Error deleting address" });
    }
  },
};

export default AddressController;
