import { Alert } from 'react-native';
import { confirmDestructiveImport } from './importBackup';

describe('confirmDestructiveImport', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves true when the user confirms the destructive import', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((b) => b.text === 'Import')?.onPress?.();
    });

    await expect(confirmDestructiveImport()).resolves.toBe(true);
  });

  it('resolves false when the user cancels', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((b) => b.text === 'Cancel')?.onPress?.();
    });

    await expect(confirmDestructiveImport()).resolves.toBe(false);
  });
});
