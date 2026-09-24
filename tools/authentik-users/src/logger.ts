const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";

export const logger = {
  info(msg: string) {
    console.log(`${CYAN}ℹ${RESET} ${msg}`);
  },
  step(msg: string) {
    console.log(`${BLUE}▶${RESET} ${msg}`);
  },
  success(msg: string) {
    console.log(`${GREEN}✅${RESET} ${msg}`);
  },
  warn(msg: string) {
    console.log(`${YELLOW}⚠${RESET} ${msg}`);
  },
  error(msg: string) {
    console.error(`${RED}❌${RESET} ${msg}`);
  },
  dry(msg: string) {
    console.log(`${MAGENTA}🔍${RESET} ${DIM}[dry-run]${RESET} ${msg}`);
  },
  header(msg: string) {
    console.log(`\n${BOLD}${msg}${RESET}`);
  },
};