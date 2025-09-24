import { useState, useCallback } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

export interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnectable: boolean | null;
}

export const useBleScan = () => {
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback((bleManager: BleManager, targetDeviceName?: string) => {
    if (isScanning) return;

    setScannedDevices([]);
    setError(null);
    setIsScanning(true);

    console.log('BLEスキャンを開始します...');

    bleManager.startDeviceScan(
      null, // フィルタなし（全デバイスをスキャン）
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('スキャンエラー:', error);
          setError(error.message);
          setIsScanning(false);
          return;
        }

        if (device) {
          console.log('発見されたデバイス:', device.name || 'Unknown', device.id);
          
          const newDevice: ScannedDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            isConnectable: device.isConnectable,
          };

          setScannedDevices(prev => {
            // 重複を避ける
            const exists = prev.find(d => d.id === device.id);
            if (exists) return prev;
            
            // ターゲットデバイス名が指定されている場合は、その名前を含むデバイスのみを表示
            if (targetDeviceName) {
              if (device.name && device.name.includes(targetDeviceName)) {
                return [...prev, newDevice];
              }
              return prev;
            }
            
            return [...prev, newDevice];
          });
        }
      }
    );
  }, [isScanning]);

  const stopScan = useCallback((bleManager: BleManager) => {
    if (!isScanning) return;

    console.log('BLEスキャンを停止します...');
    bleManager.stopDeviceScan();
    setIsScanning(false);
  }, [isScanning]);

  const clearDevices = useCallback(() => {
    setScannedDevices([]);
    setError(null);
  }, []);

  return {
    scannedDevices,
    isScanning,
    error,
    startScan,
    stopScan,
    clearDevices,
  };
};
