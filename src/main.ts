import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pl from './locales/pl.json'
import { polishPluralRules } from './utils/i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: {
    en,
    pl,
  },
  pluralRules: {
    pl: polishPluralRules,
  },
})

const app = createApp(App)

app.use(i18n)
app.mount('#app')
