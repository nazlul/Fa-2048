interface PrivyActions {
  ready: () => void;
}

interface PrivySDK {
  actions?: PrivyActions;
}

declare global {
  interface Window {
    privy?: PrivySDK;
  }
}

export {}; 