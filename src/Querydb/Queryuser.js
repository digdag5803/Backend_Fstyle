const Queryuser = {
    registerUser:`INSERT INTO Users SET ?`,
    loginUser:`SELECT * FROM Users WHERE username = ?`,
}

export default Queryuser;