import {EditorView} from "@codemirror/view";
import {Ref} from "vue";

export interface ITab {
    title: string;
    content: string;
    editorLayout: 'horizontal' | 'vertical';
    editorAutorun: boolean;
    editorAutoClearOutput: boolean;
    editorLayoutSize: number;
    terminalLayoutSize: number;
}