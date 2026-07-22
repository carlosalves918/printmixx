/** @type {import('tailwindcss').Config} */
export default {
  // Só escaneia os arquivos do painel de gestão — a fan page pública não usa
  // classes Tailwind, então não precisa (e não deve) ser escaneada aqui.
  content: ['./src/gestao/**/*.{js,jsx}'],
  corePlugins: {
    // Desligado de propósito: o "preflight" reseta margens, tipografia etc.
    // de forma global, e isso vazaria para a fan page pública. Sem ele, o
    // Tailwind só aplica as classes utilitárias que o painel de gestão usa.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
