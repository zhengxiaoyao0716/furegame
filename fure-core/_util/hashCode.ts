// https://stackoverflow.com/questions/194846/is-there-any-kind-of-hash-code-function-in-javascript/8076436#8076436
export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + code;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
