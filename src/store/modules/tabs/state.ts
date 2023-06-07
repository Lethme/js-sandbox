import {Tabs} from "@/store/types";

export interface State {
  tabs: Tabs;
  activeTabIndex: number;
  autoSave: boolean;
  autoSaveDelay: number;

  autoSaveIntervalId?: number;
}

const state: State = {
  tabs: [],
  activeTabIndex: 0,
  autoSave: false,
  autoSaveDelay: 5000,
};

export default state;
