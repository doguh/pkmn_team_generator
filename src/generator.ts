import { random, randomIndex } from "./helpers/random";
import { BaseStats, mapBaseStatsNames } from "./helpers/stats";
import { PkmnSets } from "./smogon";

type Paste = {
  paste: string;
  leadValue: number;
};

const leadMoves = ["Stealth Rock", "Sticky Web", "Spikes", "Toxic Spikes"];

export function generateRandomPaste(from: PkmnSets): string {
  const pokemons = Object.keys(from);
  const pastes: Paste[] = [];

  console.log("===============");
  for (let i = 0; i < 6; i++) {
    let leadValue = 0;
    const species = random(pokemons);
    const sets = Object.keys(from[species]);
    const setName = random(sets);
    if (setName.toLowerCase().includes("lead")) {
      leadValue += 1;
    }
    const set = from[species][setName];
    console.log(`#${i + 1} ${species} ${setName}`);
    let paste = `${species} @ ${
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
        if (leadMoves.includes(selectedMove)) {
          leadValue++;
        }
      }
    });
    paste += moves.map((move) => `\n- ${move}`).join("");

    pastes.push({ paste, leadValue });
  }

  // place mon with the highest leadValue first
  pastes.sort((a, b) => b.leadValue - a.leadValue);

  return pastes.map((p) => p.paste).join("\n\n");
}
