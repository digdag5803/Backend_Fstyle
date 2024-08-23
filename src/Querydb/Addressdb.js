const QueryAddress = {
  getAddressbyUserId: `
    SELECT * FROM shipping_addresses WHERE user_id =?;
    `,
  createAddress: ` INSERT INTO shipping_addresses (user_id, recipient_name, street_address, city, state, postal_code, recipient_numberphone)
  VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  updateAddress: `UPDATE shipping_addresses
  SET recipient_name=?, street_address=?,
   city=?, state=?, postal_code=?,recipient_numberphone=? WHERE address_id=? AND user_id=?
  `,
  checkUserAddress: `SELECT COUNT(*) AS count
  FROM shipping_addresses
  WHERE user_id = ? AND address_id = ?;
  `,
  deleteAddress: `DELETE FROM shipping_addresses WHERE address_id=? AND user_id=?`,
  getAddressDefault: `SELECT * FROM shipping_addresses WHERE user_id =? AND address_id=?`,
};

export default QueryAddress;
