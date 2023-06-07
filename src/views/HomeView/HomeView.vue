<template>
    <TabView :scrollable="true" v-model:activeIndex="activeTabIndex" @tab-change="editorChangeDebounced(activeTabCode)">
        <TabPanel v-for="(tab, index) in tabs" :key="tab.title">
            <template #header>
                <div class="tab-header-wrapper" @mousedown.middle="closeTab(index)" @dblclick="tabDblClick(index)">
                    <i class="pi pi-file tab-header-icon"></i>
                    <span class="tab-header-title">{{ tab.title }}</span>
                    <i class="pi pi-times tab-header-close clickable" @click.stop="closeTab(index)"></i>
                </div>
            </template>
            <Splitter @resizeend="(event) => { tab.editorLayoutSize = event.sizes[0]; tab.terminalLayoutSize = event.sizes[1] }"
                      :layout="tab.editorLayout" :class="{ 'tab-wrapper': true, [tab.editorLayout]: true }" style="max-width: 100%; overflow: auto">
                <SplitterPanel :size="tab.editorLayoutSize" :minSize="20" class="editor-wrapper">
                    <codemirror
                        v-model="tab.content"
                        style="height: 100%; width: 100%; overflow-y: auto;"
                        placeholder="Code goes here..."
                        :autofocus="true"
                        :indent-with-tab="true"
                        :tab-size="4"
                        :extensions="editorExtensions"
                        @change="editorChangeDebounced($event)"
                    />
                </SplitterPanel>
                <SplitterPanel :size="tab.terminalLayoutSize" :minSize="20" class="terminal-wrapper">
                    <Terminal prompt=">> " style="height: 100%"/>
                </SplitterPanel>
            </Splitter>
            <div class="tab-view-controls-wrapper">
                <div class="tab-view-controls sticky">
                    <i :class="{
                        'pi': true,
                        'pi-file': true,
                        'clickable': true,
                    }"
                           @click="createNewFileClick"
                           v-tooltip.left="'Create new file'"
                        />
                        <i :class="{
                        'pi': true,
                        'pi-ellipsis-h': tab.editorLayout === 'horizontal',
                        'pi-ellipsis-v': tab.editorLayout === 'vertical',
                        'clickable': true,
                    }"
                           @click="tab.editorLayout === 'horizontal' ? tab.editorLayout = 'vertical' : tab.editorLayout = 'horizontal'"
                           v-tooltip.left="tab.editorLayout === 'horizontal' ? 'Switch to vertical layout' : 'Switch to horizontal layout'"
                        />
                        <i :class="{
                        'pi': true,
                        'pi-caret-right': true,
                        'clickable': true,
                        'active': tab.editorAutorun,
                    }"
                           @click="!tab.editorAutorun && editorChangeDebounced(activeTabCode, true)"
                           @mousedown.middle="tab.editorAutorun = !tab.editorAutorun"
                           v-tooltip.left="{ value: `<h4 class='label-text' style='font-weight: 400'>Run code</h4><h5 class='label-text'>Middle click to toggle autorun</h5>`, escape: true }"
                        />
                        <i :class="{
                        'pi': true,
                        'pi-save': true,
                        'clickable': true,
                        'active': autoSave
                    }"
                           @click="$store.dispatch('saveTabs')"
                           @mousedown.middle="autoSave = !autoSave"
                           v-tooltip.left="{ value: `<h4 class='label-text' style='font-weight: 400'>Save files</h4><h5 class='label-text'>Middle click to toggle autosave</h5>`, escape: true }"
                    />
                </div>
            </div>
        </TabPanel>
    </TabView>

    <Dialog v-model:visible="newTabModalVisible" modal dismissableMask header="Create file" :style="{ width: 'auto', maxWidth: $store.getters.mobile ? '95%' : '700px' }">
        <div class="dialog-wrapper">
            <div class="input-wrapper">
                <h5 class="label-text">Filename</h5>
                <InputText
                    ref="newTabModalFileNameRef"
                    v-model="newTabModalFileName"
                    placeholder="index"
                    :style="{ minWidth: $store.getters.mobile ? '100%' : '500px' }"
                    @keydown.enter="newTabModalCreateClick"
                />
            </div>
            <div class="input-wrapper">
                <Accordion>
                    <AccordionTab header="Additional settings">
                        <div class="input-wrapper">
                            <div class="input-wrapper row" style="padding: .2em 0">
                                <InputSwitch
                                    :modelValue="newTabModalLayout === 'horizontal'"
                                    @update:modelValue="newTabModalLayout = $event ? 'horizontal' : 'vertical'"
                                />
                                <h5 class="label-text">{{ newTabModalLayout.capitalize() + ' layout' }}</h5>
                            </div>
                            <div class="input-wrapper row" style="padding: .2em 0">
                                <InputSwitch
                                    v-model="newTabModalAutorun"
                                />
                                <h5 class="label-text">{{ newTabModalAutorun ? 'Autorun code on edit' : 'Run code manually' }}</h5>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
            <div class="btn-wrapper">
                <Button label="Cancel" link @click="newTabModalVisible = false" />
                <Button label="Create" @click="newTabModalCreateClick" />
            </div>
        </div>
    </Dialog>

    <Dialog v-model:visible="editTabModalVisible" modal dismissableMask :header="editTabIndex !== undefined ? `Edit ${tabs[editTabIndex].title}` : 'Edit file'" :style="{ width: 'auto', maxWidth: $store.getters.mobile ? '95%' : '700px' }">
        <div class="dialog-wrapper">
            <div class="input-wrapper">
                <h5 class="label-text">Filename</h5>
                <InputText
                    ref="editTabModalFileNameRef"
                    v-model="editTabModalFileName"
                    placeholder="index"
                    :style="{ minWidth: $store.getters.mobile ? '100%' : '500px' }"
                    @keydown.enter="editTabModalSaveClick"
                />
            </div>
            <div class="input-wrapper">
                <Accordion>
                    <AccordionTab header="Additional settings">
                        <div class="input-wrapper">
                            <div class="input-wrapper row" style="padding: .2em 0">
                                <InputSwitch
                                    :modelValue="editTabModalLayout === 'horizontal'"
                                    @update:modelValue="editTabModalLayout = $event ? 'horizontal' : 'vertical'"
                                />
                                <h5 class="label-text">{{ editTabModalLayout.capitalize() + ' layout' }}</h5>
                            </div>
                            <div class="input-wrapper row" style="padding: .2em 0">
                                <InputSwitch
                                    v-model="editTabModalAutorun"
                                />
                                <h5 class="label-text">{{ editTabModalAutorun ? 'Autorun code on edit' : 'Run code manually' }}</h5>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
            <div class="btn-wrapper">
                <Button label="Cancel" link @click="editTabModalVisible = false" />
                <Button label="Save" @click="editTabModalSaveClick" />
            </div>
        </div>
    </Dialog>
</template>

<script lang="ts">
import {ITab, Tabs} from "@/store/types";
import {debounce} from "@/utils";
import {computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef} from "vue";
import {useStore} from "vuex";
import $ from 'jquery';

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import Dialog from 'primevue/dialog';
import InputText from "primevue/inputtext";
import InputSwitch from 'primevue/inputswitch';

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

import Terminal from 'primevue/terminal';
import TerminalService from 'primevue/terminalservice'

import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';

import {EditorView} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {Codemirror} from 'vue-codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {oneDark} from '@codemirror/theme-one-dark'

interface TerminalCommands {
    [key: string]: {
        name: string;
        description: string;
        method: (...args: Array<any>) => void;
    }
}

export default defineComponent({
    name: "HomeView",
    components: {
        TabView,
        TabPanel,
        Button,
        Terminal,
        Splitter,
        SplitterPanel,
        Dialog,
        InputText,
        Accordion,
        AccordionTab,
        InputSwitch,
        Codemirror,
    },
    setup() {
        const store = useStore();
        const tabs = computed(() => store.getters.tabs as Tabs);
        const activeTabIndex = computed({
            get(): number {
                return store.getters.activeTabIndex;
            },
            set(index: number) {
                store.commit("setActiveTab", index);
            }
        });

        const autoSave = computed({
            get(): boolean {
                return store.getters.autoSave;
            },
            set: debounce((state: boolean) => {
                store.commit("setAutoSave", state);
            })
        });

        const activeTab = computed(() => store.getters.tabs[activeTabIndex.value] as ITab);
        const activeTabCode = computed(() => activeTab.value.content);

        const newTabModalVisible = ref(false);
        const newTabModalFileName = ref('');
        const newTabModalFileNameRef = ref();
        const newTabModalLayout = ref<'horizontal' | 'vertical'>('vertical');
        const newTabModalAutorun = ref(true);

        const editTabIndex = ref<number | undefined>();
        const editTabModalVisible = ref(false);
        const editTabModalFileName = ref('');
        const editTabModalFileNameRef = ref();
        const editTabModalLayout = ref<'horizontal' | 'vertical'>('vertical');
        const editTabModalAutorun = ref(true);

        const editorExtensions = [javascript(), oneDark];

        const addTab = async () => {
            await store.dispatch("addTab", {
                title: `${newTabModalFileName.value ? newTabModalFileName.value.replace(/ /g, '_') : 'index'}.js`,
                content: "",
                editorAutorun: newTabModalAutorun.value,
                editorLayout: newTabModalLayout.value,
                editorLayoutSize: 80,
                terminalLayoutSize: 20,
            } as ITab);
        }

        const closeTab = async (index: number) => {
            if (index === tabs.value.length - 1) {
                const newIndex = tabs.value.length - 2;
                activeTabIndex.value = newIndex > 0 ? newIndex : 0;
            }

            if (activeTabIndex.value > index) {
                activeTabIndex.value -= 1;
            }

            await store.dispatch("closeTab", index);
        }

        const createNewFileClick = async () => {
            newTabModalVisible.value = true;

            queueMicrotask(() => {
                newTabModalFileNameRef.value?.$el?.focus();
            });
        }

        const tabDblClick = async (index: number) => {
            const tab = tabs.value[index];
            editTabIndex.value = index;
            editTabModalAutorun.value = tab.editorAutorun;
            editTabModalLayout.value = tab.editorLayout;
            editTabModalFileName.value = tab.title.split('.')[0];
            editTabModalVisible.value = true;
            editTabModalFileNameRef.value?.$el?.focus();
        }

        const editTabModalSaveClick = async () => {
            if (editTabIndex.value !== undefined) {
                const tab = tabs.value[editTabIndex.value];
                tab.title = editTabModalFileName.value ? `${editTabModalFileName.value.replace(/ /g, '_')}.js` : 'index.js';
                tab.editorLayout = editTabModalLayout.value;
                tab.editorAutorun = editTabModalAutorun.value;
                editTabModalVisible.value = false;
                editTabIndex.value = undefined;
            }
        }

        const newTabModalCreateClick = async () => {
            await addTab();
            newTabModalVisible.value = false;
            newTabModalAutorun.value = true;
            newTabModalLayout.value = "vertical";
            newTabModalFileName.value = '';

            activeTabIndex.value = tabs.value.length - 1;
        }

        const clearCurrentTerminal = () => {
            const activeTabElement = $('.p-tabview-panel').eq(activeTabIndex.value);

            if (activeTabElement) {
                const terminalContentElement = activeTabElement.find('.p-terminal .p-terminal-content');

                if (terminalContentElement) {
                    terminalContentElement.find('div').remove();
                }
            }
        }

        const showResult = (...strings: string[]) => {
            const activeTabElement = $('.p-tabview-panel').eq(activeTabIndex.value);

            if (activeTabIndex) {
                const terminalContentElement = activeTabElement.find('.p-terminal .p-terminal-content');

                if (terminalContentElement) {
                    //terminalContentElement.find('div').remove();
                    strings.forEach(str => {
                        let resultStr: Array<string> = [];

                        if (str || str == '0') {
                            try {
                                const jsonStr = JSON.stringify(str, null, 4).split('\n');
                                resultStr = jsonStr;
                            } catch {
                                resultStr = str.split ? str.split('\n') : [];
                            }
                        }

                        resultStr.forEach((s) => {
                            terminalContentElement.append(`<div><span>${s.replace(/ /g, '&nbsp;')}</span></div>`);
                        });
                    });
                }
            }
        }

        const editorChange = async (code: string, force = false) => {
            if (activeTab.value.editorAutorun || force) {
                clearCurrentTerminal();

                let resultCode = `
                            /**
                 * @typedef {Object.<string, Function[]>} EventHandlerMap
                 */

                /**
                 * A simple EventEmitter class for registering and emitting events.
                 */
                class EventEmitter {
                    /**
                     * The map of registered event handlers.
                     * @type {EventHandlerMap}
                     */
                    #events = {};

                    #uniqueArray(array) {
                        return array.filter(function (item, pos) {
                            return array.indexOf(item) == pos;
                        });
                    }

                    #on(event, callback) {
                        if (event && callback) {
                            if (this.#events[event]) {
                                this.#events[event].push(callback);
                            } else {
                                this.#events[event] = [callback];
                            }
                        }
                    }

                    #off(event, callback) {
                        if (event && this.#events[event]) {
                            if (callback) {
                                this.#events[event] = this.#events[event].filter(c => c !== callback);

                                if (!this.#events[event].length) {
                                    delete this.#events[event];
                                }
                            } else {
                                delete this.#events[event];
                            }
                        }
                    }

                    async #emit(event, ...args) {
                        if (event && this.#events[event]) {
                            const callbacks = this.#events[event];

                            for (let i = 0; i < callbacks.length; i++) {
                                await callbacks[i].call(null, ...args);
                            }
                        }
                    }

                    /**
                     * Registers an event handler for the specified event.
                     * @param {string} event - The name of the event.
                     * @param {Function} callback - The function to be called when the event is emitted.
                     */
                    on(event, callback) {
                        if (event && callback) {
                            if (Array.isArray(event)) {
                                this.#uniqueArray(event).forEach(e => this.#on(e, callback));
                            } else {
                                this.#on(event, callback);
                            }
                        }
                    }

                    /**
                     * Removes the specified event handler for the specified event.
                     * @param {string} event - The name of the event.
                     * @param {Function} callback - The function to be removed from the event handlers.
                     */
                    off(event, callback) {
                        if (event) {
                            if (Array.isArray(event)) {
                                this.#uniqueArray(event).forEach(e => this.#off(e, callback));
                            } else {
                                this.#off(event, callback);
                            }
                        }
                    }

                    /**
                     * Checks whether any event handler is registered for the specified event.
                     * @param {string} event - The name of the event.
                     * @returns {boolean} - True if there is at least one event handler for the specified event, false otherwise.
                     */
                    has(event) {
                        return Boolean(this.#events[event] && this.#events[event].length);
                    }

                    /**
                     * Emits the specified event with the given arguments.
                     * @param {string} event - The name of the event to be emitted.
                     * @param  {...any} args - The arguments to be passed to the event handlers.
                     * @returns {Promise<void>} - A promise that resolves when all event handlers have completed.
                     */
                    async emit(event, ...args) {
                        if (event) {
                            if (Array.isArray(event)) {
                                this.#uniqueArray(event).forEach(async (e) => await this.#emit(e, ...args));
                            } else {
                                await this.#emit(event, ...args);
                            }
                        }
                    }
                }
            function wait(ms = 1000) { return new Promise(r => setTimeout(r, ms)) };
            function log(...strings) {
            const activeTabElement = $('.p-tabview-panel').eq(${activeTabIndex.value});

            if (activeTabElement) {
                const terminalContentElement = activeTabElement.find('.p-terminal .p-terminal-content');

                if (terminalContentElement) {
                    strings.forEach(str => {
                        let resultStr = [];

                        if (str || str == 0) {
                            try {
                                const jsonStr = JSON.stringify(str, null, 4).split('\\n');
                                resultStr = jsonStr;
                            } catch {
                                resultStr = str?.split('\\n') || [];
                            }
                        }

                        resultStr.forEach((s) => {
                            terminalContentElement.append('<div><span>' + s.replace(/ /g, '&nbsp;') + '</span></div>');
                        })
                    });
                }
            }
            } \n\n${code}`;

                try {
                    const importsRegex = /import\s+['"](.+?)['"](;)?/g;

                    resultCode = resultCode.replace(importsRegex, (match, filename) => {
                        if (!(filename as string).endsWith('.js')) {
                            filename = `${filename}.js`;
                        }

                        const targetTab = tabs.value.find(tab => tab.title === filename);

                        if (targetTab) {
                            return targetTab.content;
                        }

                        return '';
                    });

                    const test = eval(resultCode.replace(/console.log\(/g, 'log\('));

                    if (test) {
                        showResult(test);
                    }
                } catch (e: any) {
                    if (e.message) {
                        showResult(e.message);
                    }
                }
            }
        }

        const editorChangeDebounced = debounce(editorChange, 350);

        return {
            tabs,
            autoSave,
            activeTabIndex,
            activeTabCode,
            editorExtensions,
            newTabModalVisible,
            newTabModalFileName,
            newTabModalLayout,
            newTabModalAutorun,
            newTabModalFileNameRef,
            editTabIndex,
            editTabModalVisible,
            editTabModalFileName,
            editTabModalFileNameRef,
            editTabModalLayout,
            editTabModalAutorun,
            addTab,
            closeTab,
            tabDblClick,
            editorChangeDebounced,
            newTabModalCreateClick,
            editTabModalSaveClick,
            createNewFileClick,
            log: console.log,
        }
    }
})
</script>

<style scoped>
@import "HomeView.css";
</style>