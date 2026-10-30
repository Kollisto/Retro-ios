// Labels and texts in the phone's language: system icons use the names iOS 5 gave them in
// that language; third-party apps keep their brand names. Unknown languages fall back to English.

const LANGS = {
  en: {
    apps: { messages: "Messages", calendar: "Calendar", photos: "Photos", camera: "Camera", maps: "Maps",
      weather: "Weather", notes: "Notes", reminders: "Reminders", clock: "Clock", settings: "Settings",
      phone: "Phone", mail: "Mail", refresh: "Refresh", goose: "Goose" },
    note: "Buy…",
    sheet: ["Choose Wallpaper from Photos", "Default Wallpaper", "Cancel"],
    tooBig: "Couldn't save the wallpaper: the picture is too large.",
    gooseNotes: ["The goose was here", "Go to sleep", "Honk!", "Drink some water", "I ate your bread", "Don't touch me", "Out of bread"],
  },
  ru: {
    apps: { messages: "Сообщения", calendar: "Календарь", photos: "Фото", camera: "Камера", maps: "Карты",
      weather: "Погода", notes: "Заметки", reminders: "Напоминания", clock: "Часы", settings: "Настройки",
      phone: "Телефон", mail: "Почта", refresh: "Обновить", goose: "Гусь" },
    note: "Купить…",
    sheet: ["Выбрать обои из Фото", "Стандартные обои", "Отменить"],
    tooBig: "Не удалось сохранить обои: картинка слишком большая.",
    gooseNotes: ["Гусь был здесь", "Иди спать", "Га-га!", "Попей воды", "Я съел твой хлеб", "Не трогай меня", "Хлеб кончился"],
  },
  uk: {
    apps: { messages: "Повідомлення", calendar: "Календар", photos: "Фото", camera: "Камера", maps: "Карти",
      weather: "Погода", notes: "Нотатки", reminders: "Нагадування", clock: "Годинник", settings: "Параметри",
      phone: "Телефон", mail: "Пошта", refresh: "Оновити", goose: "Гусак" },
    note: "Купити…",
    sheet: ["Вибрати шпалери з Фото", "Стандартні шпалери", "Скасувати"],
    tooBig: "Не вдалося зберегти шпалери: зображення завелике.",
    gooseNotes: ["Тут був гусак", "Іди спати", "Ґа-ґа!", "Попий води", "Я з'їв твій хліб", "Не чіпай мене", "Хліб скінчився"],
  },
  de: {
    apps: { messages: "Nachrichten", calendar: "Kalender", photos: "Fotos", camera: "Kamera", maps: "Karten",
      weather: "Wetter", notes: "Notizen", reminders: "Erinnerungen", clock: "Uhr", settings: "Einstellungen",
      phone: "Telefon", mail: "Mail", refresh: "Neu laden", goose: "Gans" },
    note: "Kaufen…",
    sheet: ["Hintergrund aus Fotos", "Standardhintergrund", "Abbrechen"],
    tooBig: "Hintergrund konnte nicht gesichert werden: das Bild ist zu groß.",
    gooseNotes: ["Die Gans war hier", "Geh schlafen", "Schnatter!", "Trink Wasser", "Ich hab dein Brot gegessen", "Fass mich nicht an", "Brot ist alle"],
  },
  fr: {
    apps: { messages: "Messages", calendar: "Calendrier", photos: "Photos", camera: "Appareil photo", maps: "Plans",
      weather: "Météo", notes: "Notes", reminders: "Rappels", clock: "Horloge", settings: "Réglages",
      phone: "Téléphone", mail: "Mail", refresh: "Actualiser", goose: "Oie" },
    note: "Acheter…",
    sheet: ["Choisir un fond dans Photos", "Fond d'écran par défaut", "Annuler"],
    tooBig: "Impossible d'enregistrer le fond d'écran : l'image est trop grande.",
    gooseNotes: ["L'oie est passée ici", "Va dormir", "Coin coin !", "Bois de l'eau", "J'ai mangé ton pain", "Ne me touche pas", "Plus de pain"],
  },
  es: {
    apps: { messages: "Mensajes", calendar: "Calendario", photos: "Fotos", camera: "Cámara", maps: "Mapas",
      weather: "Tiempo", notes: "Notas", reminders: "Recordatorios", clock: "Reloj", settings: "Ajustes",
      phone: "Teléfono", mail: "Mail", refresh: "Actualizar", goose: "Ganso" },
    note: "Comprar…",
    sheet: ["Elegir fondo de Fotos", "Fondo por omisión", "Cancelar"],
    tooBig: "No se pudo guardar el fondo: la imagen es demasiado grande.",
    gooseNotes: ["El ganso estuvo aquí", "Vete a dormir", "¡Cua cua!", "Bebe agua", "Me comí tu pan", "No me toques", "Se acabó el pan"],
  },
  it: {
    apps: { messages: "Messaggi", calendar: "Calendario", photos: "Foto", camera: "Fotocamera", maps: "Mappe",
      weather: "Meteo", notes: "Note", reminders: "Promemoria", clock: "Orologio", settings: "Impostazioni",
      phone: "Telefono", mail: "Mail", refresh: "Aggiorna", goose: "Oca" },
    note: "Comprare…",
    sheet: ["Scegli sfondo da Foto", "Sfondo predefinito", "Annulla"],
    tooBig: "Impossibile salvare lo sfondo: l'immagine è troppo grande.",
    gooseNotes: ["L'oca è stata qui", "Vai a dormire", "Qua qua!", "Bevi acqua", "Ho mangiato il tuo pane", "Non toccarmi", "Pane finito"],
  },
  pt: {
    apps: { messages: "Mensagens", calendar: "Calendário", photos: "Fotos", camera: "Câmera", maps: "Mapas",
      weather: "Tempo", notes: "Notas", reminders: "Lembretes", clock: "Relógio", settings: "Ajustes",
      phone: "Telefone", mail: "Mail", refresh: "Atualizar", goose: "Ganso" },
    note: "Comprar…",
    sheet: ["Escolher fundo das Fotos", "Fundo padrão", "Cancelar"],
    tooBig: "Não foi possível salvar o fundo: a imagem é grande demais.",
    gooseNotes: ["O ganso esteve aqui", "Vai dormir", "Quá quá!", "Beba água", "Comi seu pão", "Não me toque", "Acabou o pão"],
  },
  pl: {
    apps: { messages: "Wiadomości", calendar: "Kalendarz", photos: "Zdjęcia", camera: "Aparat", maps: "Mapy",
      weather: "Pogoda", notes: "Notatki", reminders: "Przypomnienia", clock: "Zegar", settings: "Ustawienia",
      phone: "Telefon", mail: "Poczta", refresh: "Odśwież", goose: "Gęś" },
    note: "Kupić…",
    sheet: ["Wybierz tapetę ze Zdjęć", "Domyślna tapeta", "Anuluj"],
    tooBig: "Nie udało się zapisać tapety: obraz jest za duży.",
    gooseNotes: ["Gęś tu była", "Idź spać", "Gę gę!", "Napij się wody", "Zjadłam twój chleb", "Nie dotykaj mnie", "Chleb się skończył"],
  },
  lt: {
    apps: { messages: "Žinutės", calendar: "Kalendorius", photos: "Nuotraukos", camera: "Kamera", maps: "Žemėlapiai",
      weather: "Orai", notes: "Užrašai", reminders: "Priminimai", clock: "Laikrodis", settings: "Nustatymai",
      phone: "Telefonas", mail: "Paštas", refresh: "Atnaujinti", goose: "Žąsis" },
    note: "Nupirkti…",
    sheet: ["Fonas iš Nuotraukų", "Numatytasis fonas", "Atšaukti"],
    tooBig: "Nepavyko išsaugoti fono: paveikslėlis per didelis.",
    gooseNotes: ["Čia buvo žąsis", "Eik miegoti", "Ga ga!", "Atsigerk vandens", "Suvalgiau tavo duoną", "Neliesk manęs", "Duonos nebėra"],
  },
};

const LANG = (() => {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  for (const tag of prefs) {
    const code = String(tag).slice(0, 2).toLowerCase();
    if (LANGS[code]) return code;
  }
  return "en";
})();
const T = LANGS[LANG];
document.documentElement.lang = LANG;

// a label for an app: its iOS name in this language, or the brand name
const appLabel = (app) => T.apps[app.id] || LANGS.en.apps[app.id] || app.name;

// weekday for the Calendar icon, in the same language as the labels
const weekday = (date) => date.toLocaleDateString(LANG, { weekday: "long" });
