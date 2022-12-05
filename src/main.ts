import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import VueAxios from "vue-axios";
import axios from "axios";
import "primevue/resources/themes/md-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

createApp(App)
  .use(VueAxios, axios)
  .provide("axios", axios)
  .use(PrimeVue)
  .mount("#app");
