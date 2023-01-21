import express from "express";
import { generateRandomPaste } from "./generator";
import { getJSONSets } from "./smogon";

const app = express();

// format = gen8nationaldex
app.get("/paste/:format/:raw?", async (req, res, next) => {
  try {
    const data = await getJSONSets(req.params.format);
    const paste = generateRandomPaste(data);
    res.set("content-type", "text/plain");
    res.send(paste);
  } catch (err) {
    next(err);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
