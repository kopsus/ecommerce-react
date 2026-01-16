interface Window {
  snap: {
    pay: (token: string, options: SnapCallbacks) => void;
  };
}

interface SnapCallbacks {
  onSuccess: (result: any) => void;
  onPending: (result: any) => void;
  onError: (result: any) => void;
  onClose: () => void;
}
