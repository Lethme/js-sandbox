import { createStore } from "vuex";
import modules from "@/store/modules";

const Store = createStore({
  modules: {
    ...modules,
  },
});

export default Store;