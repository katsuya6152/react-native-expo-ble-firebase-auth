import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BleManager } from "react-native-ble-plx";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { useBlePermissions } from "./hooks/useBlePermissions";
import { useBleScan, ScannedDevice } from "./hooks/useBleScan";
import { useBleConnection } from "./hooks/useBleConnection";
import { useBleNotification } from "./hooks/useBleNotification";
import { AuthScreen } from "./components/AuthScreen";
import { BleScanScreen } from "./components/BleScanScreen";
import { SensorDataScreen } from "./components/SensorDataScreen";

// BLE設定定数（Raspberry Pi側の設定に合わせて変更してください）
const TARGET_DEVICE_NAME = "RasPiSensor"; // Raspberry Piのデバイス名
const SENSOR_SERVICE_UUID = "12345678-1234-1234-1234-123456789abc"; // センサーサービスのUUID
const SENSOR_DATA_CHAR_UUID = "87654321-4321-4321-4321-cba987654321"; // センサーデータのキャラクタリスティクスUUID

export default function App() {
	return (
		<SafeAreaProvider>
			<AppContent />
		</SafeAreaProvider>
	);
}

function AppContent() {
	const [bleManager] = useState(() => {
		try {
			return new BleManager();
		} catch (error) {
			console.warn("BLE Manager initialization failed:", error);
			return null;
		}
	});
	const {
		user,
		isLoading: authLoading,
		signIn,
		signUp,
		logout,
	} = useFirebaseAuth();
	const {
		permissionsGranted,
		isLoading: permissionLoading,
		requestBlePermissions,
	} = useBlePermissions();
	const { scannedDevices, isScanning, startScan, stopScan } = useBleScan();
	const {
		connectedDevice,
		isConnecting,
		connectToDevice,
		disconnectFromDevice,
	} = useBleConnection();
	const {
		sensorData,
		isSubscribed,
		subscribeToNotifications,
		unsubscribeFromNotifications,
	} = useBleNotification();

	// BLE権限が許可されたらスキャンを開始
	useEffect(() => {
		if (
			bleManager &&
			permissionsGranted &&
			!isScanning &&
			scannedDevices.length === 0
		) {
			startScan(bleManager, TARGET_DEVICE_NAME);
		}
	}, [
		bleManager,
		permissionsGranted,
		isScanning,
		scannedDevices.length,
		startScan,
	]);

	// デバイス接続時に通知を購読
	useEffect(() => {
		if (connectedDevice && !isSubscribed) {
			subscribeToNotifications(
				connectedDevice,
				SENSOR_SERVICE_UUID,
				SENSOR_DATA_CHAR_UUID,
			);
		}
	}, [connectedDevice, isSubscribed, subscribeToNotifications]);

	// アプリ終了時のクリーンアップ
	useEffect(() => {
		return () => {
			if (isSubscribed) {
				unsubscribeFromNotifications();
			}
			if (isScanning && bleManager) {
				stopScan(bleManager);
			}
			if (bleManager) {
				bleManager.destroy();
			}
		};
	}, [
		isSubscribed,
		isScanning,
		unsubscribeFromNotifications,
		stopScan,
		bleManager,
	]);

	const handleDeviceConnect = async (device: ScannedDevice) => {
		if (!bleManager) return;
		const success = await connectToDevice(bleManager, device.id);
		if (success) {
			stopScan(bleManager);
		}
	};

	const handleDisconnect = async () => {
		if (isSubscribed) {
			unsubscribeFromNotifications();
		}
		if (bleManager) {
			await disconnectFromDevice(bleManager);
		}
	};

	// ローディング画面
	if (authLoading || permissionLoading) {
		return (
			<SafeAreaView
				style={styles.container}
				edges={["top", "left", "right", "bottom"]}
			>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#007AFF" />
					<Text style={styles.loadingText}>
						{authLoading ? "認証状態を確認中..." : "BLE権限を確認中..."}
					</Text>
				</View>
				<StatusBar style="auto" />
			</SafeAreaView>
		);
	}

	// 認証されていない場合
	if (!user) {
		return (
			<SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
				<AuthScreen onSignIn={signIn} onSignUp={signUp} />
				<StatusBar style="auto" />
			</SafeAreaView>
		);
	}

	// デバイスが接続されている場合
	if (connectedDevice) {
		return (
			<SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
				<SensorDataScreen
					deviceName={connectedDevice.name || "Unknown Device"}
					sensorData={sensorData}
					isSubscribed={isSubscribed}
					onDisconnect={handleDisconnect}
					onLogout={logout}
				/>
				<StatusBar style="auto" />
			</SafeAreaView>
		);
	}

	// BLEスキャン画面
	return (
		<SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
			<BleScanScreen
				devices={scannedDevices}
				isScanning={isScanning}
				isConnecting={isConnecting}
				onDeviceConnect={handleDeviceConnect}
				onRefresh={() =>
					bleManager && startScan(bleManager, TARGET_DEVICE_NAME)
				}
				onLogout={logout}
			/>
			<StatusBar style="auto" />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
	},
});
