export const DEFAULT_TEST_PATH = '/lab.step.test.js'
export const CHECK_TIMEOUT_MS = 30000
export const CLIENT_POLL_MS = 200
export const CLIENT_MAX_ATTEMPTS = 50
export const CHECK_START_DELAY_MS = 350
/** Tempo máx. para a preview reexecutar após o Verificar e enviar console.log. */
export const CONSOLE_CAPTURE_GRACE_MS = 2000
export const CONSOLE_CAPTURE_AFTER_DONE_MS = 250
/** Ignora cliques repetidos no Verificar (leading-edge). */
export const VERIFY_CLICK_DEBOUNCE_MS = 1000
/** Cold start do bundler Sandpack — clear de isWaking no done/success ou neste timeout. */
export const WAKING_TIMEOUT_MS = 8000
/** Debounce hot → cold quando Result fechado e idle. */
export const RUNTIME_COLD_DEBOUNCE_MS = 400

/** Espera o rebundle do restore terminar antes de limpar + refresh do console. */
export const RESTORE_SETTLE_DELAY_MS = 350
/** Delay entre reset do console e o refresh único de captura. */
export const CONSOLE_REFRESH_DELAY_MS = 50
/** Primeiro poll do LabJestRunner após bumpCheckId. */
export const JEST_TRY_RUN_INITIAL_DELAY_MS = 50
/** Janela curta para logs atrasados da mesma execução no console. */
export const CONSOLE_LATE_WINDOW_MS = 400
/** Soft-retry quando o arquivo ainda não foi transpiled (1ª e 2ª tentativa). */
export const TRANSPILE_RETRY_DELAY_MS = [1200, 2000] as const

export const STUDENT_CODE_PATHS = ['/App.js', '/index.js'] as const

/** Invalida cache do SandpackProvider quando o bootstrap React muda. */
export const LAB_REACT_BOOTSTRAP_VERSION = 'rb3'
