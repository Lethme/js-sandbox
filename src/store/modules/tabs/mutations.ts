import store from "@/store";
import {EditorView} from "@codemirror/view";
import {State} from "./state";
import {ITab, Tabs} from "@/store/types";
import {debounce} from "@/utils";

const mutations = {
	setActiveTab(state: State, payload: number) {
		if (payload < state.tabs.length && payload > -1 && Math.floor(payload) === payload) {
			state.activeTabIndex = payload;
		}
	},
	setAutoSave(state: State, payload: boolean) {
		if (!state.autoSave && payload) {
			state.autoSaveIntervalId = setInterval(() => {
				store.commit('saveTabs');
			}, state.autoSaveDelay);

			state.autoSave = payload;
		}

		if (state.autoSave && !payload) {
			clearInterval(state.autoSaveIntervalId);
			state.autoSave = payload;
		}
	},
	setAutoSaveDelay(state: State, payload: number) {
		if (payload >= 1000) {
			const initAutoSaveState = state.autoSave;
			store.commit('setAutoSave', false);

			state.autoSaveDelay = payload;

			if (initAutoSaveState) {
				store.commit('setAutoSave', true);
			}
		}
	},
	setTabs(state: State, payload: Tabs) {
		state.tabs = payload;
	},
	addTab(state: State, payload: ITab) {
		state.tabs.push(payload);
	},
	closeTab(state: State, payload: number) {
		state.tabs.splice(payload, 1);

		if (!state.tabs.length) {
			store.commit("addTab", {
				title: "index.js",
				content: "",
				editorAutorun: true,
				editorLayout: "vertical",
				editorAutoClearOutput: true,
				editorLayoutSize: 80,
				terminalLayoutSize: 20,
			})
		}
	},
	saveTabs: debounce((state: State) => {
		localStorage.setItem('js-sandbox-tabs', JSON.stringify(state.tabs));
		localStorage.setItem('js-sandbox-active-index', JSON.stringify(state.activeTabIndex));
	}, 300),
	loadTabs: debounce((state: State) => {
		try {
			const tabsJson = localStorage.getItem('js-sandbox-tabs');
			const activeTabIndexJson = localStorage.getItem('js-sandbox-active-index');

			if (tabsJson) {
				state.tabs = JSON.parse(tabsJson);
			} else {
				throw new Error();
			}

			if (activeTabIndexJson) {
				state.activeTabIndex = JSON.parse(activeTabIndexJson);
			} else {
				throw new Error();
			}
		} catch {
			store.commit('addTab', {
				title: "index.js",
				content: "",
				editorAutorun: true,
				editorAutoClearOutput: true,
				editorLayout: "vertical",
				editorLayoutSize: 80,
				terminalLayoutSize: 20,
			});

			state.activeTabIndex = 0;
		}
	}),
};

export default mutations;
