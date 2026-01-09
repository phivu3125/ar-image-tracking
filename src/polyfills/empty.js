// Empty polyfill for Node.js modules not available in browser
export default {};
export const readFileSync = () => null;
export const existsSync = () => false;
