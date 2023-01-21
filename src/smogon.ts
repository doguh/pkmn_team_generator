import axios from "axios";
import memoizee from "memoizee";
import { BaseStats } from "./helpers/stats";

export type PkmnSet = {
  moves: (string | string[])[];
  ability?: string | string[];
  item: string | string[];
  nature: string | string[];
  ivs?: BaseStats;
  evs: BaseStats;
};

export type PkmnSets = Record<string, Record<string, PkmnSet>>;

// https://github.com/pkmn/smogon/tree/main/data/sets
export const getJSONSets = memoizee(
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

const formatsCombinations = [
  "gen8nationaldexag",
  "gen8nationaldex",
  "gen8ubers",
  "gen7ubers",
  "gen8ou",
  "gen7ou",
];

export const getCombinedJSONSets = memoizee(
  async function getCombinedJSONSets(format: string): Promise<PkmnSets> {
    const index = formatsCombinations.indexOf(format);
    if (index === -1) {
      return getJSONSets(format);
    }
    const formats = formatsCombinations.slice(index);
    const sets = await Promise.all(formats.map(getJSONSets));
    return sets.reduce((acc, val) => {
      return {
        ...val,
        ...acc,
      };
    }, {} as PkmnSets);
  },
  {
    promise: true,
    maxAge: 1000 * 60 * 50,
  }
);
