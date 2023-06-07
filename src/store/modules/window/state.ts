export interface State {
  windowWidth: number;
  windowHeight: number;
}

const state: State = {
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
};

export default state;
