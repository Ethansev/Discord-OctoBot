import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.post("/", (req, res) => {
  res.sendStatus(200);
});

export function runServer() {
  app
    .listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    })
    .on("error", (err: any) => {
      console.log(err);
    });
}
