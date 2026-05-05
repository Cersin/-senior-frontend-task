import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pl from './locales/pl.json'

// Polish pluralization rules: 1, 2-4, 5+
const polishPluralRules = (choice: number): number => {
  if (choice === 1) return 0
  if (choice % 10 >= 2 && choice % 10 <= 4 && (choice % 100 < 10 || choice % 100 >= 20)) return 1
  return 2
}

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
