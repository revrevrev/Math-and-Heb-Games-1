let _goSettings = null;
export const Navigation = {
  register: (fn) => { _goSettings = fn; },
  goSettings: () => { if (_goSettings) _goSettings(); },
};
