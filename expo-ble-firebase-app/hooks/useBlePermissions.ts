import { useState, useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export const useBlePermissions = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const requestBlePermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      setPermissionsGranted(true);
      setIsLoading(false);
      return true;
    }

    try {
      const permissions = [];
      
      // Android 12+ (API 31+) では新しいBLE権限が必要
      if (Platform.Version >= 31) {
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      } else {
        // Android 10/11 では位置情報権限が必要
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }

      // 各権限をリクエスト
      for (const permission of permissions) {
        const granted = await PermissionsAndroid.request(permission as any, {
          title: 'Bluetooth権限',
          message: 'このアプリはBluetoothデバイスと通信するために権限が必要です',
          buttonNeutral: '後で',
          buttonNegative: '拒否',
          buttonPositive: '許可',
        });

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            '権限が必要です',
            'Bluetooth機能を使用するには権限の許可が必要です。設定から権限を許可してください。',
            [
              { text: 'キャンセル', style: 'cancel' },
              { text: '設定を開く', onPress: () => {
                // 設定アプリを開く処理（必要に応じて実装）
              }}
            ]
          );
          setPermissionsGranted(false);
          setIsLoading(false);
          return false;
        }
      }

      setPermissionsGranted(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('BLE権限のリクエストに失敗しました:', error);
      Alert.alert('エラー', '権限のリクエスト中にエラーが発生しました');
      setPermissionsGranted(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    requestBlePermissions();
  }, [requestBlePermissions]);

  return {
    permissionsGranted,
    isLoading,
    requestBlePermissions,
  };
};
