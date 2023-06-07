import {ActionContext} from "vuex";
import {State} from "./state";
import {Tabs, ITab} from "@/store/types";

const actions = {
	async setActiveTab(context: ActionContext<State, any>, payload: number) {
		context.commit('setActiveTab', payload);
	},
	async updateTabs(context: ActionContext<State, any>, payload: Tabs) {
		context.commit("setTabs", payload);
	},
	async addTab(context: ActionContext<State, any>, payload: ITab) {
		context.commit("addTab", payload);
	},
	async closeTab(context: ActionContext<State, any>, payload: number) {
		context.commit("closeTab", payload);
	},
	async saveTabs(context: ActionContext<State, any>) {
		context.commit('saveTabs');
	},
	async loadTabs(context: ActionContext<State, any>) {
		context.commit('loadTabs');
	},
	setAutoSave(context: ActionContext<State, any>, payload: boolean){
		context.commit('setAutoSave', payload);
	},
	setAutoSaveDelay(context: ActionContext<State, any>, payload: number){
		context.commit('setAutoSaveDelay', payload);
	},
};

export default actions;
