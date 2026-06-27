import type { Dictionary } from "./de";

/**
 * Spanish dictionary — satisfies the `Dictionary` type derived from `de.ts`.
 *
 * Translation notes:
 *   • Tu-form (tuteo) used throughout, consistent with the German Du-form.
 *   • Wire-protocol identifiers ({book_list}, {firstName}, sheet names, etc.)
 *     are intentionally left untranslated — they are code, not UI text.
 *   • Number locale → "es-ES" (dot-thousands, comma-decimal).
 *   • Date format  → DD/MM/YYYY (common in Spain and Latin America).
 */
export const es: Dictionary = {
  app: {
    title: "OpenLibry Biblioteca",
  },
  topbar: {
    brand: "OpenLibry",
    tagline: "Gestión de Biblioteca",
    openMenu: "Abrir navegación",
    closeMenu: "Cerrar menú",
    admin: "Administración",
    logout: "Cerrar sesión",
  },
  holdButton: {
    deleteLabel: "Eliminar",
    tooltip: "Mantén pulsado para confirmar",
  },
  nav: {
    rental: {
      title: "Préstamos",
      subtitle: "Préstamo y devolución",
    },
    user: {
      title: "Usuarios",
      subtitle: "Gestión de usuarios",
    },
    book: {
      title: "Libros",
      subtitle: "Catálogo de medios",
    },
    reports: {
      title: "Informes",
      subtitle: "Resumen del catálogo",
    },
  },
  home: {
    chooseSection: "Elige una sección para comenzar",
  },
  rental: {
    searchBookPlaceholder: "Buscar libro",
    searchUserPlaceholder: "Buscar usuario",
    clearSearch: "Borrar búsqueda",
    searchBooksAria: "search books",
    searchUsersAria: "search users",

    extend: "Renovar",
    extendAria: "extend",
    maxExtensionReached: "Se ha alcanzado el tiempo máximo de préstamo",
    return: "Devolver",
    returnAria: "zurückgeben",
    rent: "Prestar",
    rentAria: "ausleihen",

    noUsersFound: "No se encontraron usuarios",
    cancelSelection: "Cancelar selección",
    searchSettings: "Configuración de búsqueda",
    searchSettingsAria: "search-settings",

    bookSingular: "libro",
    bookPlural: "libros",

    userMetaPrefix: "N.º",
    userMetaGrade: "Curso",

    noBorrowedBooks: "No hay libros prestados",

    bookNumberPrefix: "N.º",
    bookRentedUntil: "prestado hasta",
    bookRentedTo: "a",
    rentalUntilPrefix: "hasta",
    renewalCountSuffix: "x renovado",

    toastAlreadyRented: "El libro {bookId} ya está prestado",
    toastBookNotFound: "Libro {bookId} no encontrado",
    showingFirst: "Más resultados disponibles",

    statusBroken: "Dañado",
    statusPresentation: "Ejemplar de muestra",
    statusOrdered: "Pedido",
    statusLost: "Perdido",
    statusRemote: "Otra biblioteca",
    statusUnknown: "Estado desconocido ({status})",
    statusBadgeAria: "Estado: {status}",
  },
  rentSearchParams: {
    overdue: "Vencido",
    grade: "Curso",
  },
  rentalPage: {
    serverReachableButFailed:
      "Lo sentimos, algo salió mal, pero el servidor está disponible",
    serverUnreachable:
      "El servidor no está disponible. ¿Hay algún problema con la conexión?",

    bookReturned: "Libro — {title} — devuelto",
    bookAlreadyMaxExtended:
      "Libro — {title} — ya está prestado hasta el máximo permitido",
    bookExtended: "Libro — {title} — renovado",
    bookRented: "Libro {title} prestado",
  },

  // ── Phase 4b additions ────────────────────────────────────────────────
  bookSearchBar: {
    placeholder: "Buscar libro…",
    ariaLabel: "search books",
    toggleView: "Cambiar vista",
    newBook: "Crear nuevo libro",
    importMany: "Importar varios libros",
  },
  userSearchBar: {
    placeholder: "Buscar por nombre o ID...",
    ariaLabel: "search users",
    searchSettings: "Configuración de búsqueda",
    cancelSelection: "Cancelar selección",
    selectAll: "Seleccionar todos",
    newUser: "Crear nuevo usuario",
    selected: "seleccionado",
    deselect: "Deseleccionar",
    actions: "Acciones",
    increaseGrade: "Subir de curso",
    deleteUsers: "Eliminar usuarios",
    confirmDelete: "¿Realmente eliminar?",
  },
  userSearchFilters: {
    filter: "Filtro",
    active: "Activo",
    reset: "Restablecer",
    resetTooltip: "Restablecer filtros",
    status: "Estado",
    onlyOverdue: "Solo vencidos",
    grade: "Curso",
    allGrades: "Todos los cursos",
    overdueChip: "Vencido",
    gradeChipPrefix: "Curso",
  },
  userAdminList: {
    noUsersSearch: "No se encontraron usuarios",
    noUsersEmpty: "Aún no hay usuarios",
    tryDifferentSearch: "Prueba con otro término de búsqueda",
    createNewToBegin: "Crea un nuevo usuario para comenzar",
    booksRentedSingular: "libro prestado",
    booksRentedPlural: "libros prestados",
    hasOverdue: "Tiene libros vencidos",
    metaPrefix: "N.º",
    gradePrefix: "Curso",
    rentalSection: "Libros prestados",
    noBorrowedBooks: "No hay libros prestados",
    edit: "Editar",
    printUserLabel: "Imprimir carnet de usuario",
    showingFirst: "Más resultados disponibles",
  },
  newUserDialog: {
    title: "Crear nuevo usuario",
    subtitle: "Añadir usuario a la biblioteca",
    autoBadge: "Auto",
    autoIdLabel: "ID automático",
    autoIdHint: "Se asignará automáticamente el próximo número disponible",
    userIdLabel: "ID de usuario",
    cancel: "Cancelar",
    create: "Crear",
  },
  userEditForm: {
    bookSingular: "libro",
    bookPlural: "libros",
    overdue: "vencido",
    metaPrefix: "N.º",
    gradePrefix: "Curso",
    sectionPersonalData: "Datos",
    fieldFirstName: "Nombre",
    fieldLastName: "Apellido",
    fieldGrade: "Curso",
    fieldTeacher: "Docente",
    fieldCreatedAt: "Creado el",
    fieldLastUpdated: "Última actualización",
    createdAtValue: "Usuario creado el {date} con número de carnet {id}",
    activeLabel: "Activo",
    activeHintActive: "El usuario puede prestar libros",
    activeHintInactive: "El usuario está desactivado",
    sectionBorrowedBooks: "Libros prestados",
    noBorrowedBooks: "No hay libros prestados",
    idNotFound: "ID no encontrado",
    alreadyReturned: "Ya devuelto",
    return: "Devolver",
    extend: "Renovar",
    edit: "Editar",
    cancel: "Cancelar",
    save: "Guardar",
    print: "Imprimir",
    delete: "Eliminar",
  },
  bookEditForm: {
    save: "Guardar",
    saving: "Guardando...",
    saveTitleNew: "Crear y guardar libro",
    saveTitleExisting: "Guardar",
    cancel: "Cancelar",
    cancelTitle: "Cancelar y volver al resumen",
    delete: "Eliminar",
    sectionIsbn: "ISBN y datos principales",
    sectionBookData: "Datos del libro",
    sectionPublisher: "Editorial y edición",
    sectionRentalStatus: "Estado del préstamo",
    sectionMore: "Más datos",
    autofill: "Rellenar",
    autofillSearching: "Buscando...",
    autofillTitle:
      "Buscar datos principales y portada con ISBN (DNB, Google Books, OpenLibrary)",
    fetchCover: "Portada",
    fetchCoverLoading: "Cargando...",
    fetchCoverTitle: "Cargar portada desde ISBN (OpenLibrary)",
    statusLabel: "Estado",
    renewalsLabel: "Renovaciones",
    coverPreviewAlt: "Vista previa de portada",
    coverImageAlt: "cover image",
    coverPlaceholderInitial: "Introduce el ISBN y haz clic en 'Rellenar'",
    coverSearching: "Buscando portada...",
    coverNotFound: "No se encontró portada",
    coverWillUpload: "✓ La portada se subirá al guardar",
    coverUploadAfterSave:
      "La portada se puede subir manualmente después de guardar",
    antolinLabel: "Antolin:",
    antolinPlaceholder: "...",
    antolinManyFound: " {count} libros similares",
    antolinNoneFound: " Ningún libro encontrado",
    antolinOneFound: " Un libro encontrado",
    toastEnterIsbn: "Por favor, introduce un ISBN.",
    toastIsbnInvalid: "El ISBN no es válido (no se encontraron números).",
    toastIsbnInvalidShort: "El ISBN no es válido.",
    toastNoIsbn: "No hay ISBN registrado en el libro.",
    toastSaveFirst: "El libro debe guardarse primero.",
    toastIsbnNotFound: "No se encontraron datos principales con este ISBN.",
    toastDataAndCoverLoaded:
      "Los datos principales y la portada se cargaron correctamente.",
    toastDataLoaded: "Los datos principales se completaron correctamente.",
    toastDataLoadError: "Error al cargar los datos del libro.",
    toastCoverLoaded: "Portada cargada correctamente desde {source}.",
    toastCoverSourceUnknown: "desconocido",
    toastCoverNotFound: "No se pudo encontrar la portada.",
    toastCoverLoadError: "Error al cargar la portada.",
    openCameraScanner: "Abrir escáner de cámara",
  },
  bookSelect: {
    renewalNone: "No renovado",
    renewalCountFormat: "{n}x renovado",
  },
  userPage: {
    toastUserCreateFailed:
      "No se pudo crear el nuevo usuario. ¿El ID de usuario ya existe?",
    toastGradeIncreased: "Curso aumentado para los alumnos",
    toastUsersDeleted: "Alumnos eliminados correctamente",
  },
  userDetailPage: {
    idNotFound: "ID no encontrado",
    toastUserSaved: "Usuario {firstName} {lastName} guardado",
    toastBookReturned: "¡Libro devuelto correctamente!",
    toastBookAlreadyMaxExtended:
      "Libro — {title} — ya está prestado hasta el máximo permitido",
    toastServerReachableButFailed:
      "Lo sentimos, algo salió mal, pero el servidor está disponible",
    toastBookExtended: "¡Libro renovado correctamente!",
    toastUserDeleted: "¡Usuario eliminado!",
  },
  bookPage: {
    toastCreateNewBook:
      "Crear nuevo libro — introduce los datos o escanea el ISBN",
    toastBookReturned: "Libro devuelto",
    toastReturnError: "Error al devolver el libro",
    loadMore: "Más libros...",
    isbnCopies: "{{count}} ejemplares con este ISBN",
  },

  // ── Phase 5: authentication pages ────────────────────────────────────
  authError: {
    pageTitle: "Error de inicio de sesión | OpenLibry",
    heading: "Error de inicio de sesión",
    errorCodePrefix: "Código de error:",
    backToLogin: "Volver al inicio de sesión",
    codes: {
      Signin: "Error al iniciar sesión. Por favor, inténtalo de nuevo.",
      OAuthSignin: "Error al establecer la conexión OAuth.",
      OAuthCallback: "Error en la respuesta OAuth.",
      OAuthCreateAccount: "No se pudo crear la cuenta OAuth.",
      EmailCreateAccount: "No se pudo crear la cuenta de correo.",
      Callback: "Error al procesar la respuesta.",
      OAuthAccountNotLinked: "Este correo ya está vinculado a otra cuenta.",
      CredentialsSignin: "Usuario o contraseña incorrectos.",
      SessionRequired: "Por favor, inicia sesión para continuar.",
      Default: "Se produjo un error desconocido.",
    },
  },
  login: {
    pageTitle: "Iniciar sesión | OpenLibry",
    heading: "Acceder a OpenLibry",
    subtitle: "Por favor, inicia sesión",
    labelUsername: "Nombre de usuario",
    labelPassword: "Contraseña",
    placeholderUsername: "Introduce el nombre de usuario",
    placeholderPassword: "Introduce la contraseña",
    submitting: "Iniciando sesión…",
    submit: "Iniciar sesión",
    errorFailed: "Error al iniciar sesión. Por favor, comprueba los datos.",
    errorConnection: "Error de conexión. Por favor, inténtalo de nuevo.",
  },
  register: {
    pageTitle: "Registrarse | OpenLibry",
    heading: "Crear nuevo usuario",
    subtitle: "Crear acceso de administrador para OpenLibry",
    labelUsername: "Nombre de usuario",
    labelEmail: "Correo electrónico",
    labelPassword: "Contraseña",
    labelPasswordConfirm: "Repetir contraseña",
    placeholderUsername: "Introduce el nombre de usuario",
    placeholderEmail: "Introduce el correo electrónico",
    placeholderPassword: "Mínimo 3 caracteres",
    placeholderPasswordConfirm: "Confirmar contraseña",
    passwordTooShort: "La contraseña debe tener al menos 3 caracteres",
    passwordMismatch: "Las contraseñas no coinciden",
    submitting: "Creando…",
    submit: "Crear usuario",
    errorCreate: "Error al crear ({status})",
    errorUnknown: "Error desconocido. Por favor, inténtalo de nuevo.",
  },

  // ─── Phase 6: admin settings page ────────────────────────────────────
  admin: {
    pageTitle: "Configuración | OpenLibry",
    backToAdmin: "Volver a la administración",
    heading: "Configuración",
    subheading: "Compilar y descargar los ajustes para el archivo .env",

    infoBanner: {
      title: "Cómo funciona esta página",
      bodyP1: "Aquí puedes crear un archivo ",
      bodyCode: ".env",
      bodyP2: ". Todos los datos permanecen en el navegador — ",
      bodyStrong: "no se guarda ni se envía nada",
      bodyP3:
        ". Descarga el archivo y colócalo en el directorio de OpenLibry. Luego reinicia OpenLibry.",
      bareMetalCmd: "Bare Metal: pm2 restart openlibry",
      dockerCmd: "Docker: docker restart openlibry",
    },

    preview: {
      title: "Vista previa: .env",
      copyDone: "¡Copiado!",
      copyAction: "Copiar al portapapeles",
    },

    stickyBar: {
      varCount: "{count} variables configuradas",
      reset: "Restablecer",
      download: "Descargar .env",
    },

    sectionCard: {
      hintTooltip: "Mostrar sugerencia",
      showAdvancedSingular: "Mostrar {n} ajuste avanzado",
      showAdvancedPlural: "Mostrar {n} ajustes avanzados",
      hideAdvanced: "Ocultar ajustes avanzados",
    },

    passwordField: {
      placeholder: "Introduce o genera un valor aleatorio...",
      hide: "Ocultar",
      show: "Mostrar",
      copy: "Copiar",
      copied: "¡Copiado!",
      copyTitle: "Copiar al portapapeles",
      generate: "Generar",
      generateTitle: "Generar un valor aleatorio seguro",
      strength: "✓ {chars} caracteres — suficientemente seguro",
    },

    envHeaders: {
      technical: "🔧 CONFIGURACIÓN TÉCNICA",
      school: "🏫 CONFIGURACIÓN ESCOLAR",
      reminder: "📧 GESTIÓN DE AVISOS",
      userlabels: "🆔 CARNETS DE USUARIO",
    },

    units: {
      days: "días",
      seconds: "segundos",
    },

    placeholders: {
      schoolName: "Colegio Ejemplo",
      reminderName: "Biblioteca Escolar",
    },

    sections: {
      technical: {
        title: "Configuración técnica",
        description:
          "Conexión de base de datos, autenticación y rutas del servidor",
        fields: {
          OPENLIBRY_LOCALE: {
            label: "Idioma (servidor)",
            description:
              "Idioma para textos del lado del servidor, informes y mensajes de error.",
            hint: "Debe coincidir con NEXT_PUBLIC_OPENLIBRY_LOCALE.",
            options: { de: "Deutsch", en: "English" },
          },
          NEXT_PUBLIC_OPENLIBRY_LOCALE: {
            label: "Idioma (navegador)",
            description: "Idioma para la interfaz de usuario en el navegador.",
            hint: "Debe coincidir con OPENLIBRY_LOCALE. Ambas variables deben tener siempre el mismo valor.",
            options: { de: "Deutsch", en: "English" },
          },
          DATABASE_URL: {
            label: "Ruta de base de datos",
            description:
              "Ruta al archivo de base de datos SQLite. Relativa al directorio de la aplicación.",
            hint: "Ejemplo: file:./database/dev.db — la carpeta debe existir y tener permisos de escritura.",
          },
          NEXTAUTH_URL: {
            label: "URL de la aplicación",
            description:
              "URL completa de la aplicación tal como se accede desde el navegador. Necesaria para las redirecciones de inicio de sesión.",
            hint: "Para instalación local: http://localhost:3000. Con nginx: https://biblioteca.colegio.es",
          },
          NEXTAUTH_SECRET: {
            label: "Clave de seguridad (Secret)",
            description:
              "Clave secreta aleatoria para el cifrado de sesiones y tokens.",
            hint: "Mínimo 32 caracteres. Una vez establecida, no la cambies — se cerrarán las sesiones de todos los usuarios. Tip: pwgen 32 1",
          },
          AUTH_ENABLED: {
            label: "Autenticación activada",
            description:
              "Determina si se requiere inicio de sesión. Solo desactivar durante la configuración inicial.",
            hint: "⚠️ ¡Siempre activar en uso escolar!",
          },
          COVERIMAGE_FILESTORAGE_PATH: {
            label: "Ruta para imágenes de portada",
            description:
              "Directorio donde se almacenan las portadas de libros subidas.",
            hint: "En Docker: /app/images (en el contenedor). Sin Docker: p. ej. ./images",
          },
          LOGIN_SESSION_TIMEOUT: {
            label: "Tiempo de espera de sesión",
            description:
              "Tiempo en segundos hasta el cierre de sesión automático por inactividad.",
          },
          LOGIN_IMAGE: {
            label: "Imagen de fondo de la página de inicio de sesión",
            description:
              "Nombre de archivo de una imagen en el directorio /public usada como fondo de la página de inicio de sesión. Dejar vacío para usar la imagen predeterminada.",
            hint: "p. ej. schule_login.jpg (el archivo debe estar en el directorio /public de la aplicación).",
          },
          MAX_MIGRATION_SIZE: {
            label: "Tamaño máx. de archivo de importación",
            description:
              "Tamaño máximo de archivo para importaciones JSON (p. ej. migración desde OpenBiblio).",
          },
          SECURITY_HEADERS: {
            label: "Cabeceras de seguridad",
            description:
              "Controla las cabeceras Content-Security-Policy. Dejar vacío en producción.",
            hint: 'Solo establecer "insecure" para desactivar las cabeceras CSP (no recomendado).',
            options: {
              active: "Activo (estándar, recomendado)",
              insecure: "Desactivado (solo desarrollo)",
            },
          },
          DELETE_SAFETY_SECONDS: {
            label: "Retraso de eliminación",
            description:
              "Tiempo de espera en segundos antes de eliminar definitivamente un libro/usuario. Da tiempo para cancelar.",
          },
          RENTAL_SORT_BOOKS: {
            label: "Orden en vista de préstamos",
            description:
              "Orden de clasificación predeterminado de los libros en la vista de préstamos.",
            options: {
              title_asc: "Título A–Z",
              title_desc: "Título Z–A",
              id_asc: "ID ascendente",
              id_desc: "ID descendente",
            },
          },
          BARCODE_MINCODELENGTH: {
            label: "Longitud mínima de código de barras",
            description:
              "Los códigos de barras más cortos se rellenan con espacios hasta alcanzar esta longitud.",
          },
          ADMIN_BUTTON_SWITCH: {
            label: "Mostrar botón de administración",
            description:
              "Muestra el botón de copia de seguridad en la barra de navegación.",
            options: {
              show: "Mostrar",
              hide: "Ocultar",
            },
          },
          NUMBER_BOOKS_OVERVIEW: {
            label: "Libros por página",
            description: "Número de libros por página en la lista de resumen.",
          },
          NUMBER_BOOKS_MAX: {
            label: "Número máximo de libros",
            description:
              "Número máximo esperado de libros en la biblioteca. Afecta a la búsqueda y la paginación.",
          },
        },
      },
      school: {
        title: "Configuración escolar",
        description: "Nombre, logotipo, plazos de préstamo y etiquetas",
        fields: {
          SCHOOL_NAME: {
            label: "Nombre del colegio",
            description:
              "Nombre completo del colegio — se muestra en la interfaz, carnets, etiquetas e informes.",
            hint: 'Ejemplo: "Colegio Público Las Flores"',
          },
          LOGO_LABEL: {
            label: "Logotipo del colegio (nombre de archivo)",
            description:
              "Nombre de archivo del logotipo del colegio en el directorio public/. Se usa en carnets de usuario y en la interfaz.",
            hint: "El archivo debe estar en /public (Bare Metal) o en database/custom/ (Docker).",
          },
          RENTAL_DURATION_DAYS: {
            label: "Plazo de préstamo",
            description:
              "Duración estándar del préstamo en días desde el momento del préstamo.",
          },
          EXTENSION_DURATION_DAYS: {
            label: "Duración de la renovación",
            description:
              "Número de días por los que se puede renovar un préstamo.",
          },
          MAX_EXTENSIONS: {
            label: "Renovaciones máximas",
            description:
              "Número máximo de veces que se puede renovar un libro.",
          },
          LABEL_CONFIG_DIR: {
            label: "Directorio de configuración de etiquetas",
            description:
              "Directorio para hojas de etiquetas (sheets/) y plantillas (templates/). Las hojas y plantillas se guardan como archivos JSON en subcarpetas.",
            hint: "Predeterminado: ./database/custom/labels — en Docker, database/custom/ se monta como volumen para conservar las configuraciones personalizadas en las actualizaciones.",
          },
        },
      },
      reminder: {
        title: "Gestión de avisos",
        description: "Configuración para cartas de aviso automáticas",
        fields: {
          REMINDER_TEMPLATE_DOC: {
            label: "Plantilla de aviso",
            description:
              "Nombre de archivo de la plantilla Word (.docx) para cartas de aviso.",
            hint: "El archivo debe estar en database/custom/ (Docker) o en el directorio de la aplicación.",
          },
          REMINDER_RESPONSIBLE_NAME: {
            label: "Responsable",
            description:
              "Nombre de la persona o departamento responsable que aparece en las cartas de aviso.",
          },
          REMINDER_RESPONSIBLE_EMAIL: {
            label: "Correo de contacto",
            description:
              "Dirección de correo electrónico que figura como contacto en las cartas de aviso.",
          },
          REMINDER_RENEWAL_COUNT: {
            label: "Repeticiones máximas de aviso",
            description:
              "Número de veces que se puede renovar un aviso antes de escalar.",
          },
        },
      },
      userlabels: {
        title: "Carnets de usuario",
        description: "Diseño y contenido de los carnets de alumno impresos",
        fields: {
          USERID_LABEL_IMAGE: {
            label: "Imagen de fondo",
            description:
              "Nombre de archivo de la imagen de fondo para los carnets de usuario. En database/custom/ (Docker) o public/ (Bare Metal).",
          },
          USERLABEL_WIDTH: {
            label: "Ancho del carnet",
            description:
              "Ancho de un carnet de usuario en unidades CSS. Afecta la representación en el navegador.",
            hint: "Valores típicos: 42vw, 9cm, 400px",
          },
          USERLABEL_PER_PAGE: {
            label: "Carnets por página",
            description: "Número de carnets de usuario por página impresa.",
          },
          USERLABEL_SEPARATE_COLORBAR: {
            label: "Barra de color",
            description:
              'Barra de color opcional debajo de la imagen. Formato: [ancho, alto, "color"]',
            hint: "Nombres de colores CSS o valores hexadecimales, p. ej. lightgreen, #4caf50",
          },
          USERLABEL_LINE_1: {
            label: "Línea de texto 1",
            description:
              'Primera línea de texto en el carnet. Formato: ["contenido","top","left","ancho","margen","color",tamaño]',
            hint: "Marcadores: User.firstName, User.lastName, User.schoolGrade",
          },
          USERLABEL_LINE_2: {
            label: "Línea de texto 2",
            description:
              "Segunda línea de texto en el carnet (misma sintaxis que la línea 1).",
          },
          USERLABEL_LINE_3: {
            label: "Línea de texto 3",
            description:
              "Tercera línea de texto en el carnet (misma sintaxis que la línea 1).",
          },
          USERLABEL_BARCODE: {
            label: "Posición del código de barras",
            description:
              'Posición y tamaño del código de barras en el carnet. Formato: ["top","left","ancho","alto","tipo"]',
          },
        },
      },
    },
  },

  // ─── Phase 7a: reports dashboard + cards ─────────────────────────────
  formats: {
    numberLocale: "es-ES",
    timeLocale: "es-ES",
  },
  reportsPage: {
    cardUsers: {
      title: "Usuarios",
      subtitle: "Resumen de todos los usuarios",
      unit: "Usuarios",
    },
    cardBooks: {
      title: "Libros",
      subtitle: "Resumen de todos los libros",
      unit: "Libros",
    },
    cardRentals: {
      title: "Préstamos",
      subtitle: "Resumen de todos los préstamos",
      unit: "Préstamos",
    },
    cardUserHistory: {
      title: "Historial de préstamos",
      subtitle: "Historial de todos los préstamos por usuario",
      unit: "Préstamos",
    },
    cardAudit: {
      title: "Historial",
      subtitle: "Actividad de libros/usuarios",
      unit: "Entradas",
    },
    cardUserLabels: {
      title: "Carnets",
      subtitle: "Lista de todos los carnets",
    },
    cardReminder: {
      title: "Avisos",
      subtitle: "Imprimir avisos como documento Word",
    },
  },
  reportCard: {
    generateTable: "Generar tabla",
  },
  excelCard: {
    title: "Excel",
    subtitle: "Importación y exportación de datos",
    exportButton: "Descargar exportación",
    importButton: "Subir importación",
  },
  reminderCard: {
    reminderSingular: "aviso",
    reminderPlural: "avisos",
    modeAll: "Todos los avisos",
    modeNonExtendable: "Solo no renovables",
    generate: "Generar Word",
    toastNoneAll: "No hay préstamos vencidos.",
    toastNoneNonExtendable: "No hay préstamos vencidos no renovables.",
  },
  userLabelsCard: {
    countLabel: "Número de etiquetas",
    countTooMany: "¿Hay tantos?",
    idRangeHeading: "Rango de ID",
    fromId: "Desde ID",
    toId: "Hasta ID",
    filtersHeading: "Filtros",
    singleIdLabel: "Etiqueta para ID de usuario",
    classFilterLabel: "Filtro de clase",
    classSelectPlaceholder: "Seleccionar clase…",
    classSearchPlaceholder: "Buscar clase…",
    classNotFound: "No se encontró ninguna clase.",
    filterClear: "Restablecer filtros",
    generatePdf: "Generar PDF",
  },
  bookLabelPrintCard: {
    title: "Imprimir etiquetas de libros",
    description:
      "Generar etiquetas como PDF. Elige plantilla y hoja, filtra libros, establece la posición de inicio.",
    button: "Imprimir etiquetas",
  },
  bookLabelEditorCard: {
    title: "Editar plantilla de etiquetas",
    description:
      "Asignar campos, ajustar tamaños de fuente, configurar el ancho del lomo. Vista previa directa en el navegador.",
    button: "Editar plantilla",
  },

  // ─── Phase 7b1: report table pages ───────────────────────────────────
  reportTable: {
    loadError: "Error al cargar los datos: {error}",
    noData: "No hay datos disponibles",
    excelExport: "Exportar a Excel",
    pdfExport: "Exportar a PDF",
    rowsPerPage: "Filas por página:",
    pageOfTotal: "Página {page} de {total}",
    back: "Volver",
  },
  reportBooksPage: {
    statusOne: "📚 {total} libro • {rented} prestado • {available} disponible",
    statusMany:
      "📚 {total} libros • {rented} prestados • {available} disponibles",
  },
  reportUsersPage: {
    statusBaseOne: "👥 {totalCount} usuario • {grades} cursos",
    statusBaseMany: "👥 {totalCount} usuarios • {grades} cursos",
    statusInactiveSuffix: "({inactiveCount} inactivos)",
  },
  reportRentalsPage: {
    overdueOne: "⚠ {count} libro vencido",
    overdueMany: "⚠ {count} libros vencidos",
    overdueNone: "✓ No hay libros vencidos",
  },
  reportHistoryPage: {
    title: "Historial de préstamos",
    titleCountSuffix: "({count} usuarios)",
    activeOnly: "Solo usuarios activos",
    exportError:
      "Error en la exportación {action}. Por favor, inténtalo de nuevo.",
    exportScopeHint:
      "La exportación incluye la vista filtrada actual ({count} usuarios).",
    colKlasse: "Curso",
    colName: "Nombre (búsqueda)",
    colTotal: "Total",
    colHistory: "Historial de préstamos",
    filterAllGrades: "Todos",
    filterNamePlaceholder: "Escribe un nombre...",
    mobileNamePlaceholder: "Buscar nombre…",
    mobileGradeAll: "Todos los cursos",
    noResults: "No hay resultados para este filtro",
    cardBooksSuffix: "libros",
    cardEmpty: "Sin préstamos",
    pdfActionExcel: "Excel",
    pdfActionPdf: "PDF",
    serverErrorLoad: "Error al cargar el historial de préstamos",
  },
  reportAuditPage: {
    searchPlaceholder: "Buscar por libros, acciones o fecha...",
    countSuffix: "{filtered} de {total} entradas",
    emptySearch: "No se encontraron resultados",
    emptyAll: "No hay actividad disponible",
    sentenceRentBookFull:
      'El libro "{bookTitle}" fue prestado a {userName} ({userId})',
    sentenceRentBookUserId:
      'El libro "{bookTitle}" fue prestado al usuario #{userId}',
    sentenceRentBookTitle: 'El libro "{bookTitle}" fue prestado',
    sentenceRentBookId: "El libro #{bookId} fue prestado",
    sentenceReturnBookTitle: 'El libro "{bookTitle}" fue devuelto',
    sentenceReturnBookId: "El libro #{bookId} fue devuelto",
    sentenceExtendBookTitle: 'El préstamo de "{bookTitle}" fue renovado',
    sentenceExtendBookId: "El préstamo del libro #{bookId} fue renovado",
    sentenceAddBook: 'Se añadió el nuevo libro "{bookTitle}"',
    sentenceUpdateBookTitle: 'El libro "{bookTitle}" fue actualizado',
    sentenceUpdateBookId: "El libro #{bookId} fue actualizado",
    sentenceDeleteBook: "El libro #{bookId} fue eliminado",
    sentenceAddUserNamed: 'Se creó el nuevo usuario "{userName}"',
    sentenceAddUserAnon: "Se creó un nuevo usuario",
    sentenceUpdateUserNamed: 'El usuario "{userName}" fue actualizado',
    sentenceUpdateUserId: "El usuario #{userId} fue actualizado",
    sentenceDeleteUser: "El usuario #{userId} fue eliminado",
    sentenceDisableUser: "El usuario #{userId} fue desactivado",
    sentenceEnableUser: "El usuario #{userId} fue activado",
    sentenceUnknownIdMissing: "?",
  },

  // ─── Phase 7b2: PDF Document content ─────────────────────────────────
  pdfDocs: {
    dateFormat: "DD/MM/YYYY",
    createdOn: "Creado el {date}",
  },
  pdfBooks: {
    titleStock: "Resumen del catálogo",
    subtitleTotal: "{total} libros en total",
    subtitleRented: " - de los cuales {rented} prestados",
    sectionRented: "Libros prestados ({count})",
    sectionAvailable: "Libros disponibles ({count})",
    emptyRented: "No hay libros prestados",
    emptyAvailable: "No hay libros disponibles",
    footer: "OpenLibry • Informe del catálogo del {date}",
    statusRented: "Prestado",
    statusAvailable: "Disponible",
    statusBroken: "Dañado",
    statusPresentation: "Exposición",
    statusOrdered: "Pedido",
    statusLost: "Perdido",
    statusRemote: "Otra biblioteca",
  },
  pdfUsers: {
    titleUsers: "Resumen de usuarios",
    subtitleTotal: "{total} usuarios en total",
    subtitleInactive: " - de los cuales {inactive} inactivos",
    sectionActive: "Usuarios activos ({count})",
    sectionInactive: "Usuarios inactivos ({count})",
    emptyActive: "No hay usuarios activos",
    footer: "OpenLibry - Informe de usuarios del {date}",
  },
  pdfRentals: {
    titleRentals: "Resumen de préstamos",
    subtitleTotal: "{total} préstamos en total",
    subtitleOverdue: " - de los cuales {overdue} vencidos",
    sectionOverdue: "Préstamos vencidos ({count})",
    sectionCurrent: "Préstamos actuales ({count})",
    emptyOverdue: "No hay préstamos vencidos",
    emptyCurrent: "No hay préstamos actuales",
    footer: "OpenLibry • Informe de préstamos del {date}",
    colName: "Nombre",
    colDelay: "Retraso",
    daysOverdueOne: "{count} día de retraso",
    daysOverdueMany: "{count} días de retraso",
    daysDueToday: "Vence hoy",
    daysRemainingOne: "{count} día restante",
    daysRemainingMany: "{count} días restantes",
  },
  pdfHistory: {
    titleHistory: "Informe del historial de préstamos",
    subtitleTotal: "{count} usuarios",
    colKlasse: "Curso",
    colName: "Nombre",
    colTotal: "Total",
    colBooks: "Libros (fecha | ID | título)",
    overflowSuffix: "… y {count} más",
    emptyData: "No hay datos disponibles",
    footer: "OpenLibry • Historial de préstamos del {date}",
    bookEntryIdLabel: "ID",
  },
  userLabelsApi: {
    placeholderError: "Error de configuración en el entorno",
  },

  // ─── Phase 8: Excel import wizard + POST API ──────────────────────────
  xlsImport: {
    pageTitle: "Importación Excel | OpenLibry",
    headerTitle: "Importación Excel",
    headerSubtitle:
      "Importar libros y usuarios desde un archivo Excel a la base de datos",
    step1Label: "Cargar archivo",
    step2Label: "Revisar y configurar",
    step3Label: "Importar",
    uploadButton: "Seleccionar archivo Excel",
    uploadButtonLoading: "Cargando…",
    uploadFormatHint:
      "Formato esperado: archivo Excel (.xlsx) con hoja 1 = Libros, hoja 2 = Usuarios",
    uploadFormatTip:
      "Consejo: usa la exportación Excel como plantilla para el formato de columnas correcto",
    summaryCardBooks: "Libros",
    summaryCardUsers: "Usuarios",
    summaryCardColumnsSuffix: "{count} columnas",
    importOptionsHeader: "Opciones de importación",
    importBooksLabelWithCount: "Importar libros ({count} entradas)",
    importBooksLabelEmpty: "Importar libros (sin datos disponibles)",
    importUsersLabelWithCount: "Importar usuarios ({count} entradas)",
    importUsersLabelEmpty: "Importar usuarios (sin datos disponibles)",
    dropBeforeImportLabel:
      "Eliminar todos los datos existentes antes de importar",
    dropWarningPrefix: "Atención:",
    dropWarningEntitiesBoth: "Libros y usuarios",
    dropWarningEntitiesBooks: "Libros",
    dropWarningEntitiesUsers: "Usuarios",
    dropWarningSuffix:
      "de la base de datos se eliminarán de forma irreversible antes de importar los nuevos datos. ¡Haz una copia de seguridad antes!",
    selectAtLeastOneOption:
      "Por favor, selecciona al menos una opción de importación con datos disponibles.",
    importButton: "Importar a la base de datos",
    importButtonLoading: "Importando…",
    statusEntityBooks: "{count} libros",
    statusEntityUsers: "{count} usuarios",
    statusEntityJoiner: " y ",
    statusSuffixWillImport: " se importarán",
    statusSuffixWithDrop: " (con eliminación previa)",
    successBanner:
      "¡Importación completada! Los datos ya están disponibles en la biblioteca.",
    errorBanner: "La importación falló. Comprueba los detalles en el registro.",
    logPanelHeader: "Registro de importación",
    logEntryCount: "{count} entradas",
    previewBooksHeader: "Vista previa: Libros",
    previewUsersHeader: "Vista previa: Usuarios",
    previewCountHint: "({total} entradas, primeras {shown} mostradas)",
    previewEmptyBooks:
      "No se encontraron datos de libros en el Excel. Asegúrate de que la primera hoja contenga la lista de libros.",
    previewEmptyUsers:
      "No se encontraron datos de usuarios en el Excel. Asegúrate de que la segunda hoja contenga la lista de usuarios.",
    previewExpandLess: "Mostrar menos",
    previewExpandMore: "{count} filas más",
    resetButton: "Restablecer",
    logInitial: "Listo para importar.",
    logFileInfo: "Archivo: {name} ({sizeKB} KB)",
    logExcelReading: "Leyendo Excel…",
    logSheetsFound: "{count} hojas encontradas: {names}",
    logBooksRecognized:
      '{rows} libros con {cols} columnas reconocidos (hoja: "{sheetName}")',
    logUsersRecognized:
      '{rows} usuarios con {cols} columnas reconocidos (hoja: "{sheetName}")',
    logSheetNoData: 'La hoja "{sheetName}" no contiene filas de datos',
    logNoBooksSheet: "No se encontró la primera hoja para los libros",
    logNoUsersSheet: "No se encontró la segunda hoja para los usuarios",
    logFileLoaded: "Archivo cargado correctamente — listo para importar",
    logLoadError: "Error al cargar: {message}",
    logImportStarted: "Importación a la base de datos iniciada…",
    logDropAnnouncement: "Los datos existentes se eliminarán primero",
    logImportComplete:
      "Importación completada: {books} libros, {users} usuarios importados",
    logImportUnknownError: "Error desconocido durante la importación",
    logNetworkError: "Error de red: {message}",
  },
  excelApi: {
    logTransferStarted: "Iniciando la transferencia a la base de datos",
    errNoOptionSelected:
      "ERROR: Debe estar activada al menos una opción de importación (libros o usuarios)",
    errNoBookData:
      "ERROR: Importación de libros activada, pero no hay datos de libros disponibles",
    errNoUserData:
      "ERROR: Importación de usuarios activada, pero no hay datos de usuarios disponibles",
    logImportSettings:
      "Configuración de importación: Libros={importBooks}, Usuarios={importUsers}, Eliminar antes={dropBeforeImport}",
    logHeaderRowsRemoved:
      "Filas de encabezado eliminadas del Excel; quedan {bookCount} libros y {userCount} usuarios",
    logDropAllBooks: "Todos los libros se eliminarán antes de la importación",
    logDropAllUsers: "Todos los usuarios se eliminarán antes de la importación",
    logUsersImporting: "Se importarán {count} usuarios",
    logUsersSkipped: "Importación de usuarios omitida (flag no activado)",
    logBooksImporting: "Se importarán {count} libros",
    logBooksSkipped: "Importación de libros omitida (flag no activado)",
    logTransactionCreated:
      "Transacción creada para todos los datos, importando ahora",
    logTransactionDone: "Datos importados correctamente",
    logNoData: "No hay datos para importar",
    logImportFailed: "Error durante la importación: {error}",
  },

  // ─── Phase 9: Reminder API ────────────────────────────────────────────
  reminderApi: {
    errUnknownTagWithSuggestion:
      "Marcador desconocido: {tag} — ¿quisiste decir {suggestion}?",
    errUnknownTagNoSuggestion:
      "Marcador desconocido: {tag} — no se sustituirá y aparecerá como texto en el documento.",
    errLoopOpenedNotClosed:
      "El bucle {loopStart} se abrió pero no se cerró con {loopEnd}.",
    errLoopEndWithoutStart:
      "Se encontró el cierre de bucle {loopEnd}, pero no hay un {loopStart} previo.",
    warnNoBookListLoop:
      "No se encontró ninguna lista de libros ({loopStart}...{loopEnd}) en la plantilla. El aviso no contendrá ninguna lista de libros.",
    warnPlaceholderUnused:
      "El marcador {placeholder} está disponible, pero no se usa en la plantilla.",
    errDryRunFailed: "La prueba de ejecución falló: {error}",
    errTemplateNotFound: 'Plantilla de aviso "{file}" no encontrada.',
    errTemplateNotFoundWithHint:
      'Plantilla de aviso "{file}" no encontrada. Por favor, coloca el archivo en database/custom/ o public/.',
    errTemplateValidationFailed: "La validación de la plantilla falló.",
    errBooksNotFound: "No se encontraron libros con los IDs indicados.",
    errGenerationFailed: "Error al generar los avisos.",
    errBodyMustContainBookIds:
      "El cuerpo de la solicitud debe contener bookIds: number[] (no vacío).",
    errNoValidNumericBookIds:
      "No se proporcionaron IDs de libro numéricos válidos.",
    statusNoRentedBooks: "No se encontraron libros prestados.",
    statusNoOverdueBooksAll:
      "No se encontraron libros vencidos que requieran aviso.",
    statusNoOverdueBooksNonExtendable:
      "No se encontraron libros vencidos no renovables que requieran aviso.",
    statusNoUsersAssigned:
      "No hay avisos que generar — ninguno de los libros está asignado a un usuario.",
  },

  // ─── Phase 11: admin index page + rentals server-side errors ─────────
  adminPage: {
    pageTitle: "Administración | OpenLibry",
    quickActionsHeading: "Acciones rápidas",
    statisticsHeading: "Estadísticas",
    systemInfoHeading: "Información del sistema",
    excelBackupTitle: "Copia de seguridad Excel",
    excelBackupDescription: "Descargar todos los datos como Excel",
    systemHealthTitle: "Estado del sistema",
    systemHealthDescription: "Diagnóstico detallado del sistema",
    settingsTitle: "Configuración",
    settingsDescription: "Ver configuración",
    statusOk: "Todo en orden",
    statusWarning: "Hay advertencias",
    statusError: "Se detectaron errores",
    loadingSystemStatus: "Cargando estado del sistema...",
    errorLoading: "Error al cargar",
    versionLine: "Versión {version} · Actualizado: {time}",
    versionUnknown: "desconocido",
    detailsButton: "Ver detalles",
    statBooks: "Libros",
    statUsers: "Usuarios",
    statActiveRentals: "Préstamos activos",
    statOverdue: "Vencidos",
    memoryUsage: "Uso de memoria",
    uptime: "Tiempo activo",
    infoEnvironment: "Entorno",
    infoNodeJs: "Node.js",
    infoPlatform: "Plataforma",
    infoAuthentication: "Autenticación",
    badgeEnabled: "Activado",
    badgeDisabled: "Desactivado",
    lastActivity: "Última actividad: {time}",
    backupErrorCreating: "¡Error al crear la copia de seguridad!",
    backupErrorDownload: "¡Error al descargar la copia de seguridad!",
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Keys to add inside the Spanish translation dictionary (lib/i18n/es.ts)
  // Must mirror the German shape exactly (TypeScript enforces this).
  // ─────────────────────────────────────────────────────────────────────────────
  healthPage: {
    pageTitle: "Estado del sistema | OpenLibry",
    loading: "Cargando estado del sistema...",
    errorLoading: "Error al cargar",
    backButton: "Volver a la administración",
    refreshButton: "Actualizar",
    statusOk: "OK",
    statusWarning: "Advertencia",
    statusError: "Error",
    allOk: "Todos los sistemas operativos",
    hasWarnings: "Advertencias detectadas",
    hasErrors: "Errores detectados",
    timestamp: "A partir de",
    versionUnknown: "desconocido",
    authEnabled: "Activada",
    authDisabled: "Desactivada",
    envLabels: {
      version: "Versión",
      environment: "Entorno",
      auth: "Autenticación",
      node: "Node.js",
    },
    stat: {
      memory: "Memoria utilizada",
      memoryTooltip:
        "Memoria del proceso del servidor Node.js (RSS) – no la RAM total del sistema operativo",
      uptime: "Tiempo activo",
      uptimeTooltip:
        "Tiempo activo del proceso Node.js desde el último reinicio",
      activeRentals: "Préstamos activos",
      activeRentalsTooltip: "Libros actualmente en préstamo",
      overdue: "Vencidos",
      overdueTooltip: "Libros que superaron su fecha de devolución",
    },
    memoryUsage: "Uso de memoria",
    check: {
      database: "Base de datos",
      data: "Datos",
      folders: "Directorios",
      files: "Archivos",
    },
    detail: {
      exists: "✓ presente",
      missing: "✗ ausente",
      writable: ", con escritura",
      configured: "(configurado)",
      standard: "(predeterminado)",
      yes: "Sí",
      no: "No",
      files: "archivos",
    },
    detailKey: {
      path: "Ruta",
      books: "Libros",
      users: "Usuarios",
      loginUsers: "Usuarios de inicio de sesión",
      error: "Error",
      databaseUrl: "URL de la base de datos",
      database: "Carpeta de base de datos",
      public: "Carpeta pública",
      prisma: "Carpeta de Prisma",
      covers: "Imágenes de portada",
      size: "Tamaño",
      sizeFormatted: "Tamaño del archivo",
    },
    footer: {
      jsonApi: "API JSON",
    },
  },
  accounts: {
    pageTitle: "Cuentas de administrador – OpenLibry",
    heading: "Cuentas de administrador",
    subtitle: "Gestiona las cuentas de acceso a OpenLibry.",
    existingAccounts: "Cuentas existentes",
    newAccountSection: "Crear nueva cuenta",
    backToAdmin: "← Volver al área de administración",
    loading: "Cargando cuentas…",
    loadError: "Error al cargar las cuentas.",
    lastAccountWarning:
      "La última cuenta no puede eliminarse. Crea primero otra cuenta.",
    selfBadge: "Tú",
    deleteTitle: "Eliminar cuenta",
    editTitle: "Editar",
    confirmDeleteQuestion: "¿Realmente eliminar?",
    confirmDeleteYes: "Sí",
    confirmDeleteNo: "No",
    toastDeleted: "Cuenta {username} eliminada.",
    toastDeleteError: "Error al eliminar la cuenta",
    toastUpdated: "Cuenta {username} actualizada.",
    toastCreated: "Nueva cuenta creada correctamente.",
    editForm: {
      labelUsername: "Nombre de usuario",
      labelEmail: "Correo electrónico",
      labelPassword: "Nueva contraseña",
      labelPasswordOptional: "(opcional)",
      labelPasswordConfirm: "Confirmar contraseña",
      placeholderPassword: "Dejar en blanco para no cambiar",
      passwordTooShort: "Mínimo 3 caracteres requeridos",
      passwordMismatch: "Las contraseñas no coinciden",
      cancel: "Cancelar",
      save: "Guardar",
    },
    createForm: {
      toggleButton: "Crear nueva cuenta de administrador",
      heading: "Nueva cuenta",
      labelUsername: "Nombre de usuario",
      labelEmail: "Correo electrónico",
      labelPassword: "Contraseña",
      labelPasswordConfirm: "Confirmar contraseña",
      passwordTooShort: "Mínimo 3 caracteres",
      passwordMismatch: "Las contraseñas no coinciden",
      cancel: "Cancelar",
      submit: "Crear cuenta",
    },
  },
  rentalsServerError: {
    invalidServerData: "Se recibieron datos no válidos del servidor",
    fetchFailed: "Error al cargar los datos de préstamos",
  },

  // ─── Catalog detail page ─────────────────────────────────────────────
  catalogDetailPage: {
    back: "Volver al catálogo",
    by: "de",
    noSummary: "Sin descripción disponible.",
    relatedBooks: "Libros similares",
    noRelatedBooks: "No se encontraron libros similares.",
    fieldPublisher: "Editorial",
    fieldYear: "Año",
    fieldPages: "Páginas",
    fieldAge: "Edad recomendada",
    fieldIsbn: "ISBN",
    notFound: "Libro no encontrado.",
  },

  // ─── Phase 11f: site footer ───────────────────────────────────────────
  footer: {
    publicCatalog: "Catálogo público",
    copyright: "Copyright",
    imprint: "Aviso legal",
    privacy: "Privacidad",
  },

  // ─── ISBN lookup API error messages ──────────────────────────────────
  // Used in pages/api/book/FillBookByIsbn.ts.
  // `fetchError.*` values appear inside the `details` array of non-200
  // responses so that users can copy-paste them into support messages.
  isbnLookup: {
    error: {
      missingParam: "Falta el parámetro ISBN",
      allServicesFailed:
        "No se pudo acceder a ninguna fuente de libros externa. Por favor, comprueba la conexión a internet del servidor.",
      partialFailure:
        "Libro no encontrado. Algunas fuentes no estaban disponibles.",
      notFound:
        "Libro no encontrado en ninguna de las fuentes de catálogo disponibles.",
      unexpected: "Error inesperado durante la búsqueda por ISBN.",
    },
    fetchError: {
      timeout: "Tiempo de espera agotado",
      connectionRefused: "Conexión rechazada",
      dnsError: "Error de DNS (host no encontrado)",
      connectionReset: "Conexión interrumpida",
      tlsError: "Error TLS/certificado",
      networkError: "Error de red",
      unknown: "Error desconocido",
    },
  },
};
