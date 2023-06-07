import {ITab, ITabButton, TabType} from "@/store/types";

export type Tab<T extends TabType> = T extends TabType.Tab ? ITab : ITabButton;
export type Tabs = Array<ITab>;