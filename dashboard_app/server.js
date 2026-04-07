const { createApp } = require("./app");

const port = Number(process.env.PORT ?? "3000");
const app = createApp();

app.listen(port, () => {
  console.log(`Dashboard listening on http://127.0.0.1:${port}`);
});
