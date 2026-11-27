import i18n from "i18n";
import path from "path";

i18n.configure({
  locales: ["en", "es", "fr"],
  defaultLocale: "en",
  directory: path.join(__dirname, "locales"),
  header: "accept-language",
  autoReload: false,
  updateFiles: false,
  objectNotation: true,
});

export default i18n;
