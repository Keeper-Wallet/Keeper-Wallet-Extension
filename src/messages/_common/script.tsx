export function Script({ script }: { script: string }) {
  return <pre data-testid="contentScript">{script}</pre>;
}
