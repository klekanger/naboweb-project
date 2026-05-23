/** HeroUI ComboBox: server-backed list; disable client-side text filtering. */
export function comboIncludeAllFilter(_textValue: string, _inputValue: string) {
  return true;
}
