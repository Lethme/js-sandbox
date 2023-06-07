import { State } from "./state";

const getters = {
  windowWidth(state: State): number {
    return state.windowWidth;
  },
  windowHeight(state: State): number {
    return state.windowHeight;
  },
  mobile(state: State): boolean {
    return state.windowWidth <= 768;
  },
};

export default getters;
