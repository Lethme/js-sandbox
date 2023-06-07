import { createApp } from "vue"
import App from "./App.vue";
import store from "./store";
import PrimeVue from "primevue/config";
import Tooltip from 'primevue/tooltip';

import "primevue/resources/themes/mdc-dark-deeppurple/theme.css";
import "primevue/resources/primevue.min.css";
import 'primeicons/primeicons.css';

import "./global.css";

import "./extensions";

createApp(App)
    .use(store)
    .use(PrimeVue, { ripple: true })
	.directive('tooltip', Tooltip)
    .mount('#app')
