import {JSX} from "vue/jsx-runtime";
import ElementClass = JSX.ElementClass;

export interface ITabButton {
	title?: string;
	icon: ElementClass;
	click: (...args: Array<any>) => void;
}