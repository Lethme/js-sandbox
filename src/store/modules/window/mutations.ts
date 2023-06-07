import state, { State } from "./state";

const mutations = {
  setWindowWidth(state: State, payload: number) {
    state.windowWidth = payload;
  },
  setWindowHeight(state: State, payload: number) {
    state.windowHeight = payload;
  },
};

export default mutations;
