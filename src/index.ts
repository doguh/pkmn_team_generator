import express from "express";
import axios from "axios";
import memoizee from "memoizee";

const app = express();

// format = gen8nationaldex
app.get("/paste/:format/:raw?", async (req, res, next) => {
  try {
    const data = await getJSONSets(req.params.format);
    const pokemons = Object.keys(data);
    const pastes: string[] = [];
    console.log("===============");
    for (let i = 0; i < 6; i++) {
      const pokemonIndex = randomIndex(pokemons.length);
      const sets = Object.keys(data[pokemons[pokemonIndex]]);
      const setIndex = randomIndex(sets.length);
      const set = data[pokemons[pokemonIndex]][sets[setIndex]];
      console.log(`#${i + 1} ${pokemons[pokemonIndex]} ${sets[setIndex]}`);
      let paste = `${pokemons[pokemonIndex]} @ ${
        Array.isArray(set.item) ? random(set.item) : set.item
      }`;
      if (set.ability) {
        paste += `\nAbility: ${
          Array.isArray(set.ability) ? random(set.ability) : set.ability
        }`;
      }
      paste += `\nLevel: 100`;
      paste += `\nIVs: ${(Object.keys(mapBaseStatsNames) as (keyof BaseStats)[])
        .map((stat) => `${set.ivs?.[stat] || 31} ${mapBaseStatsNames[stat]}`)
        .join(" / ")}`;
      paste += `\nEVs: ${(Object.keys(set.evs) as (keyof BaseStats)[])
        .map((stat) => `${set.evs[stat]} ${mapBaseStatsNames[stat]}`)
        .join(" / ")}`;
      paste += `\n${
        Array.isArray(set.nature) ? random(set.nature) : set.nature
      } Nature`;
      const moves: string[] = [];
      set.moves.forEach((move) => {
        let selectedMove: string | undefined = undefined;
        if (Array.isArray(move)) {
          let moveIndex = randomIndex(move.length);
          selectedMove = move[moveIndex];
          // make sure we don't have the same move twice
          let tries = 0;
          while (moves.includes(selectedMove) && tries < 4) {
            moveIndex = (moveIndex + 1) % move.length;
            tries++;
            selectedMove = move[moveIndex];
          }
        } else {
          selectedMove = move;
        }
        if (selectedMove) {
          moves.push(selectedMove);
        }
      });
      paste += moves.map((move) => `\n- ${move}`).join("");

      pastes.push(paste);
    }

    res.set("content-type", "text/plain");
    res.send(pastes.join("\n\n"));
  } catch (err) {
    next(err);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export type BaseStats = {
  hp?: number;
  atk?: number;
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
};

const mapBaseStatsNames: Record<keyof BaseStats, string> = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

export type PkmnSet = {
  moves: (string | string[])[];
  ability?: string | string[];
  item: string | string[];
  nature: string | string[];
  ivs?: BaseStats;
  evs: BaseStats;
};

export type PkmnSets = Record<string, Record<string, PkmnSet>>;

const getJSONSets = memoizee(
  async function getJSONSets(format: string): Promise<PkmnSets> {
    const response = await axios.get(
      `https://raw.githubusercontent.com/pkmn/smogon/main/data/sets/${format}.json`
    );
    return response.data;
  },
  {
    promise: true,
    maxAge: 1000 * 60 * 60,
  }
);

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function random<T>(list: T[]): T {
  return list[randomIndex(list.length)];
}
