import store from "@/store";
import {State} from "./state";
import {Tabs} from "@/store/types";

const getters = {
	tabs(state: State): Tabs {
		return state.tabs;
	},
	activeTabIndex(state: State): number {
		return state.activeTabIndex;
	},
	autoSave(state: State): boolean {
		return state.autoSave;
	},
};

export default getters;
