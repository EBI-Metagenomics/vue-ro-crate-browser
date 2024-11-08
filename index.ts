import { App } from "vue";
import RoCrateBrowser from "./src/components/RoCrateBrowser.vue";

export default {
    install(app: App) {
        app.component('RoCrateBrowser', RoCrateBrowser)
    }
}

export { RoCrateBrowser }