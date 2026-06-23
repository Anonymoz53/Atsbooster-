// Groq API key management — stored in localStorage
const KEY = 'atsboost_groq_key';

export function getApiKey() {
  return localStorage.getItem(KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(KEY, key.trim());
}

export function clearApiKey() {
  localStorage.removeItem(KEY);
}

export function hasApiKey() {
  return !!getApiKey();
}
