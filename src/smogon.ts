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
