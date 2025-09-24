import { useState, useCallback, useRef } from 'react';
import { Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export interface SensorData {
  timestamp: number;
  data: string;
  rawData: Uint8Array;
}

export const useBleNotification = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  // センサーデータの通知を購読
  const subscribeToNotifications = useCallback((
    device: Device,
    serviceUuid: string,
    characteristicUuid: string
  ): Promise<boolean> => {
    if (isSubscribed) return Promise.resolve(true);

    return new Promise((resolve) => {
      try {
        console.log(`通知を購読開始: ${serviceUuid}/${characteristicUuid}`);
        
        const subscription = device.monitorCharacteristicForService(
          serviceUuid,
          characteristicUuid,
          (error, characteristic) => {
            if (error) {
              console.error('通知購読エラー:', error);
              setError(error.message);
              setIsSubscribed(false);
              resolve(false);
              return;
            }

            if (!characteristic?.value) return;

            try {
              // Base64でエンコードされたデータをデコード
              const rawData = Buffer.from(characteristic.value, 'base64');
              
              // データを文字列として解釈（必要に応じて他の形式にも対応可能）
              const dataString = rawData.toString('utf8');
              
              const newSensorData: SensorData = {
                timestamp: Date.now(),
                data: dataString,
                rawData: new Uint8Array(rawData),
              };

              console.log('受信したセンサーデータ:', dataString);
              setSensorData(newSensorData);
              setError(null);
            } catch (parseError) {
              console.error('データの解析に失敗:', parseError);
              setError('データの解析に失敗しました');
            }
          }
        );

        subscriptionRef.current = subscription;
        setIsSubscribed(true);
        setError(null);
        console.log('通知購読を開始しました');
        resolve(true);
      } catch (error) {
        console.error('購読開始に失敗:', error);
        setError(error instanceof Error ? error.message : '購読開始に失敗しました');
        resolve(false);
      }
    });
  }, [isSubscribed]);

  // 通知の購読を停止
  const unsubscribeFromNotifications = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
        setIsSubscribed(false);
        console.log('通知購読を停止しました');
      } catch (error) {
        console.error('購読停止エラー:', error);
        setError(error instanceof Error ? error.message : '購読停止に失敗しました');
      }
    }
  }, []);

  // データのクリア
  const clearSensorData = useCallback(() => {
    setSensorData(null);
    setError(null);
  }, []);

  return {
    sensorData,
    isSubscribed,
    error,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    clearSensorData,
  };
};
