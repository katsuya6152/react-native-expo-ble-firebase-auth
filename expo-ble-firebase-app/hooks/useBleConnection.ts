import { useState, useCallback } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

export const useBleConnection = () => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectToDevice = useCallback(async (bleManager: BleManager, deviceId: string): Promise<boolean> => {
    if (isConnecting) return false;

    setIsConnecting(true);
    setError(null);

    try {
      console.log('デバイスに接続中...', deviceId);
      
      const device = await bleManager.connectToDevice(deviceId);
      console.log('接続成功:', device.name || deviceId);
      
      // サービスとキャラクタリスティクスを探索
      await device.discoverAllServicesAndCharacteristics();
      console.log('サービスとキャラクタリスティクスを探索完了');
      
      setConnectedDevice(device);
      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('デバイス接続エラー:', error);
      setError(error instanceof Error ? error.message : '接続に失敗しました');
      setIsConnecting(false);
      return false;
    }
  }, [isConnecting]);

  const disconnectFromDevice = useCallback(async (bleManager: BleManager): Promise<boolean> => {
    if (!connectedDevice) return false;

    try {
      console.log('デバイスから切断中...', connectedDevice.name || connectedDevice.id);
      
      await bleManager.cancelDeviceConnection(connectedDevice.id);
      console.log('切断完了');
      
      setConnectedDevice(null);
      setError(null);
      return true;
    } catch (error) {
      console.error('切断エラー:', error);
      setError(error instanceof Error ? error.message : '切断に失敗しました');
      return false;
    }
  }, [connectedDevice]);

  const getServices = useCallback(async (): Promise<any[]> => {
    if (!connectedDevice) return [];

    try {
      const services = await connectedDevice.services();
      console.log('利用可能なサービス:', services.map(s => ({ uuid: s.uuid, isPrimary: s.isPrimary })));
      return services;
    } catch (error) {
      console.error('サービスの取得に失敗:', error);
      setError(error instanceof Error ? error.message : 'サービスの取得に失敗しました');
      return [];
    }
  }, [connectedDevice]);

  const getCharacteristics = useCallback(async (serviceUuid: string): Promise<any[]> => {
    if (!connectedDevice) return [];

    try {
      const characteristics = await connectedDevice.characteristicsForService(serviceUuid);
      console.log(`サービス ${serviceUuid} のキャラクタリスティクス:`, 
        characteristics.map(c => ({ uuid: c.uuid, properties: (c as any).properties })));
      return characteristics;
    } catch (error) {
      console.error('キャラクタリスティクスの取得に失敗:', error);
      setError(error instanceof Error ? error.message : 'キャラクタリスティクスの取得に失敗しました');
      return [];
    }
  }, [connectedDevice]);

  return {
    connectedDevice,
    isConnecting,
    error,
    connectToDevice,
    disconnectFromDevice,
    getServices,
    getCharacteristics,
  };
};
