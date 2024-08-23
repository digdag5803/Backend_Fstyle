import dotenv from "dotenv";
import Sequelize from "sequelize";

dotenv.config();
const dbConfig = {
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
};
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: "mysql",
    logging: false,
  }
);
sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối thành công.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
export default sequelize;
