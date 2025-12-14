import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  de: {
    translation: {
      // Header
      header: {
        title: 'PrivateGxT',
        logout: 'Abmelden',
        admin: 'Admin Panel',
      },

      // Login Page
      login: {
        title: 'Willkommen bei PrivateGxT',
        subtitle: 'Dein DSGVO-konformer ChatBot',
        emailPlaceholder: 'E-Mail-Adresse',
        sendLink: 'Magic Link senden',
        sending: 'Wird gesendet...',
        checkEmail: 'Prüfe deine E-Mails!',
        linkSent: 'Wir haben dir einen Login-Link an {{email}} geschickt.',
        clickLink: 'Klicke auf den Link in der E-Mail, um dich anzumelden.',
        linkValid: 'Der Link ist 15 Minuten gültig.',
        checkSpam: 'Bitte schau auch im Spam-Ordner nach.',
        backToLogin: 'Zurück zum Login',
        error: 'Fehler beim Senden des Links',
        verifying: 'Verifiziere...',
        loginSuccess: 'Erfolgreich eingeloggt!',
        redirecting: 'Weiterleitung zum Dashboard...',
        info: 'Kein Passwort erforderlich. Du erhältst einen sicheren Login-Link per E-Mail.',
      },

      // Dashboard - Documents
      documents: {
        title: 'Dokumente',
        upload: 'PDF hochladen',
        uploading: 'Lädt hoch...',
        empty: 'Noch keine PDFs hochgeladen',
        deleteAll: 'Alle Daten löschen',
        confirmDelete: 'Dokument "{{filename}}" wirklich löschen?',
        confirmDeleteAll: 'Wirklich ALLE Daten löschen? (inkl. Dokumente & Chats)',
      },

      // Dashboard - Chat
      chat: {
        you: 'Du',
        placeholder: 'Nachricht an PrivateGxT...',
        send: 'Senden',
        deleteChat: 'Chat-Verlauf löschen',
        confirmDeleteChat: 'Chat-Verlauf wirklich löschen? (Dokumente bleiben erhalten)',

        // Chat Export
        export: {
          title: 'Chat exportieren',
          txt: 'Als TXT',
          json: 'Als JSON',
        },

        // Welcome Message
        welcome: {
          title: 'Hallo! Ich bin Dein persönlicher DSGVO-konformer ChatBot.',
          intro: 'Ich kann:',
          feature1: 'Deine Dokumente analysieren',
          feature2: 'Im Internet recherchieren (ohne Deine Daten preiszugeben)',
          feature3: 'Fragen basierend auf hochgeladenen PDFs beantworten',
          privacy: 'Deine Daten bleiben privat und werden nicht an Dritte weitergegeben.',
        },

        // Source Badges
        sources: {
          llmOnly: 'Direkt vom LLM',
          rag: '{{count}} Dokument(e)',
          ragPlural: '{{count}} Dokumente',
          hybrid: 'Web-Suche + {{count}} Dokument(e)',
          hybridPlural: 'Web-Suche + {{count}} Dokumente',
          webOnly: 'Web-Suche',
        },
      },

      // Toasts
      toast: {
        uploadSuccess: 'PDF erfolgreich hochgeladen & verarbeitet!',
        uploadError: 'Upload fehlgeschlagen',
        deleteSuccess: 'Dokument erfolgreich gelöscht',
        deleteError: 'Löschen fehlgeschlagen',
        chatDeleted: 'Chat-Verlauf gelöscht',
        noMessages: 'Keine Nachrichten zum Löschen',
        sendError: 'Nachricht konnte nicht gesendet werden',
      },

      // Admin Panel
      admin: {
        title: 'Admin Panel',
        close: 'Schließen',
        currentModel: 'Aktuelles Modell',
        selectModel: 'Modell wählen',
        models: 'Verfügbare Modelle',
        active: 'Aktiv',
        select: 'Auswählen',
        switching: 'Wechsle...',
        parameters: 'Parameter',
        quality: {
          low: 'Niedrig',
          medium: 'Mittel',
          high: 'Hoch',
          excellent: 'Exzellent',
        },
        note: 'Hinweis: Modellwechsel wird beim nächsten Chat-Request aktiv.',
        errors: {
          loadFailed: 'Fehler beim Laden der Admin-Daten',
          switchFailed: 'Fehler beim Wechseln des Modells',
        },
      },

      // Common
      common: {
        loading: 'Lädt...',
        error: 'Fehler',
        success: 'Erfolg',
        cancel: 'Abbrechen',
        confirm: 'Bestätigen',
        delete: 'Löschen',
      },
    },
  },

  en: {
    translation: {
      // Header
      header: {
        title: 'PrivateGxT',
        logout: 'Logout',
        admin: 'Admin Panel',
      },

      // Login Page
      login: {
        title: 'Welcome to PrivateGxT',
        subtitle: 'Your GDPR-compliant ChatBot',
        emailPlaceholder: 'Email address',
        sendLink: 'Send Magic Link',
        sending: 'Sending...',
        checkEmail: 'Check your emails!',
        linkSent: 'We sent a login link to {{email}}.',
        clickLink: 'Click on the link in the email to log in.',
        linkValid: 'The link is valid for 15 minutes.',
        checkSpam: 'Please also check your spam folder.',
        backToLogin: 'Back to Login',
        error: 'Error sending link',
        verifying: 'Verifying...',
        loginSuccess: 'Successfully logged in!',
        redirecting: 'Redirecting to Dashboard...',
        info: 'No password required. You will receive a secure login link via email.',
      },

      // Dashboard - Documents
      documents: {
        title: 'Documents',
        upload: 'Upload PDF',
        uploading: 'Uploading...',
        empty: 'No PDFs uploaded yet',
        deleteAll: 'Delete All Data',
        confirmDelete: 'Really delete document "{{filename}}"?',
        confirmDeleteAll: 'Really delete ALL data? (including documents & chats)',
      },

      // Dashboard - Chat
      chat: {
        you: 'You',
        placeholder: 'Message to PrivateGxT...',
        send: 'Send',
        deleteChat: 'Delete Chat History',
        confirmDeleteChat: 'Really delete chat history? (Documents remain)',

        // Chat Export
        export: {
          title: 'Export chat',
          txt: 'As TXT',
          json: 'As JSON',
        },

        // Welcome Message
        welcome: {
          title: 'Hello! I am your personal GDPR-compliant ChatBot.',
          intro: 'I can:',
          feature1: 'Analyze your documents',
          feature2: 'Research on the internet (without exposing your data)',
          feature3: 'Answer questions based on uploaded PDFs',
          privacy: 'Your data remains private and is not shared with third parties.',
        },

        // Source Badges
        sources: {
          llmOnly: 'Direct from LLM',
          rag: '{{count}} Document',
          ragPlural: '{{count}} Documents',
          hybrid: 'Web Search + {{count}} Document',
          hybridPlural: 'Web Search + {{count}} Documents',
          webOnly: 'Web Search',
        },
      },

      // Toasts
      toast: {
        uploadSuccess: 'PDF successfully uploaded & processed!',
        uploadError: 'Upload failed',
        deleteSuccess: 'Document successfully deleted',
        deleteError: 'Delete failed',
        chatDeleted: 'Chat history deleted',
        noMessages: 'No messages to delete',
        sendError: 'Message could not be sent',
      },

      // Admin Panel
      admin: {
        title: 'Admin Panel',
        close: 'Close',
        currentModel: 'Current Model',
        selectModel: 'Select Model',
        models: 'Available Models',
        active: 'Active',
        select: 'Select',
        switching: 'Switching...',
        parameters: 'Parameters',
        quality: {
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          excellent: 'Excellent',
        },
        note: 'Note: Model switch will be active on the next chat request.',
        errors: {
          loadFailed: 'Error loading admin data',
          switchFailed: 'Error switching model',
        },
      },

      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
      },
    },
  },

  es: {
    translation: {
      // Header
      header: {
        title: 'PrivateGxT',
        logout: 'Cerrar sesión',
        admin: 'Panel de Admin',
      },

      // Login Page
      login: {
        title: 'Bienvenido a PrivateGxT',
        subtitle: 'Tu ChatBot compatible con RGPD',
        emailPlaceholder: 'Dirección de correo electrónico',
        sendLink: 'Enviar Magic Link',
        sending: 'Enviando...',
        checkEmail: '¡Revisa tus correos!',
        linkSent: 'Hemos enviado un enlace de inicio de sesión a {{email}}.',
        clickLink: 'Haz clic en el enlace del correo para iniciar sesión.',
        linkValid: 'El enlace es válido por 15 minutos.',
        checkSpam: 'Por favor, revisa también tu carpeta de spam.',
        backToLogin: 'Volver al inicio de sesión',
        error: 'Error al enviar el enlace',
        verifying: 'Verificando...',
        loginSuccess: '¡Inicio de sesión exitoso!',
        redirecting: 'Redirigiendo al Panel de Control...',
        info: 'No se requiere contraseña. Recibirás un enlace de inicio de sesión seguro por correo electrónico.',
      },

      // Dashboard - Documents
      documents: {
        title: 'Documentos',
        upload: 'Subir PDF',
        uploading: 'Subiendo...',
        empty: 'Aún no se han subido PDFs',
        deleteAll: 'Eliminar Todos los Datos',
        confirmDelete: '¿Realmente eliminar el documento "{{filename}}"?',
        confirmDeleteAll: '¿Realmente eliminar TODOS los datos? (incluidos documentos y chats)',
      },

      // Dashboard - Chat
      chat: {
        you: 'Tú',
        placeholder: 'Mensaje a PrivateGxT...',
        send: 'Enviar',
        deleteChat: 'Eliminar Historial de Chat',
        confirmDeleteChat: '¿Realmente eliminar el historial de chat? (Los documentos permanecen)',

        // Chat Export
        export: {
          title: 'Exportar chat',
          txt: 'Como TXT',
          json: 'Como JSON',
        },

        // Welcome Message
        welcome: {
          title: '¡Hola! Soy tu ChatBot personal compatible con RGPD.',
          intro: 'Puedo:',
          feature1: 'Analizar tus documentos',
          feature2: 'Investigar en internet (sin exponer tus datos)',
          feature3: 'Responder preguntas basadas en PDFs subidos',
          privacy: 'Tus datos permanecen privados y no se comparten con terceros.',
        },

        // Source Badges
        sources: {
          llmOnly: 'Directo del LLM',
          rag: '{{count}} Documento',
          ragPlural: '{{count}} Documentos',
          hybrid: 'Búsqueda Web + {{count}} Documento',
          hybridPlural: 'Búsqueda Web + {{count}} Documentos',
          webOnly: 'Búsqueda Web',
        },
      },

      // Toasts
      toast: {
        uploadSuccess: '¡PDF subido y procesado con éxito!',
        uploadError: 'Error al subir',
        deleteSuccess: 'Documento eliminado con éxito',
        deleteError: 'Error al eliminar',
        chatDeleted: 'Historial de chat eliminado',
        noMessages: 'No hay mensajes para eliminar',
        sendError: 'No se pudo enviar el mensaje',
      },

      // Admin Panel
      admin: {
        title: 'Panel de Admin',
        close: 'Cerrar',
        currentModel: 'Modelo Actual',
        selectModel: 'Seleccionar Modelo',
        models: 'Modelos Disponibles',
        active: 'Activo',
        select: 'Seleccionar',
        switching: 'Cambiando...',
        parameters: 'Parámetros',
        quality: {
          low: 'Bajo',
          medium: 'Medio',
          high: 'Alto',
          excellent: 'Excelente',
        },
        note: 'Nota: El cambio de modelo estará activo en la próxima solicitud de chat.',
        errors: {
          loadFailed: 'Error al cargar datos de administrador',
          switchFailed: 'Error al cambiar modelo',
        },
      },

      // Common
      common: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        delete: 'Eliminar',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    debug: false,

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
