import { DataTypes, Sequelize } from "sequelize";
import express from "express";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite",
});
const PublicForm = sequelize.define("PublicForms", {
  userId: DataTypes.INTEGER,
  name: DataTypes.STRING,
  data: DataTypes.TEXT,
});

const app = express();

// CORS Headers
app.use((req, res, next) => {
  res.setHeaders(new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  }))
  next();
});

// Parse to json
app.use(express.json());

app
  .get("/pf/:name", async(req, res) => {
    const userId = 1;
    const name = req.params.name;
    const data = await PublicForm.findOne({ where: { userId, name } });

    res.json(data || {});
    res.status(200);
  })
  .put("/pf", async (req, res) => {
    const userId = 1;
    const { name, data } = req.body;
    const item = await PublicForm.findOne({ where: { userId, name } });

    if (item) {
      await item.update({ data: JSON.stringify(data) });
      res.status(204);
    } else {
      await PublicForm.create({ userId, name, data: JSON.stringify(data) });
      res.status(201);
    }
    res.send();
  });

app.listen(3000, async () => {
  await sequelize.sync();
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.addConstraint("PublicForms", {
    fields: ["userId", "name"],
    type: "unique",
    name: "unique_userId_name",
  })

  console.log("Listening on port 3000");
});
