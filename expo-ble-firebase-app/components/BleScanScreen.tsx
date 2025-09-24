import React from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { ScannedDevice } from "../hooks/useBleScan";

interface BleScanScreenProps {
	devices: ScannedDevice[];
	isScanning: boolean;
	isConnecting: boolean;
	onDeviceConnect: (device: ScannedDevice) => void;
	onRefresh: () => void;
	onLogout: () => Promise<boolean>;
}

export const BleScanScreen: React.FC<BleScanScreenProps> = ({
	devices,
	isScanning,
	isConnecting,
	onDeviceConnect,
	onRefresh,
	onLogout,
}) => {
	const renderDevice = ({ item }: { item: ScannedDevice }) => (
		<TouchableOpacity
			style={styles.deviceItem}
			onPress={() => onDeviceConnect(item)}
			disabled={isConnecting}
		>
			<View style={styles.deviceInfo}>
				<Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
				<Text style={styles.deviceId}>ID: {item.id}</Text>
				{item.rssi && (
					<Text style={styles.deviceRssi}>RSSI: {item.rssi} dBm</Text>
				)}
			</View>
			<View style={styles.connectButton}>
				{isConnecting ? (
					<ActivityIndicator size="small" color="#007AFF" />
				) : (
					<Text style={styles.connectButtonText}>接続</Text>
				)}
			</View>
		</TouchableOpacity>
	);

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				{isScanning
					? "デバイスをスキャン中..."
					: "デバイスが見つかりませんでした"}
			</Text>
			{!isScanning && (
				<TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
					<Text style={styles.refreshButtonText}>再スキャン</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>BLEデバイススキャン</Text>
				<Text style={styles.subtitle}>
					Raspberry Piセンサーデバイスを探しています...
				</Text>
				<View style={styles.statusContainer}>
					{isScanning && (
						<View style={styles.statusItem}>
							<ActivityIndicator size="small" color="#007AFF" />
							<Text style={styles.statusText}>スキャン中</Text>
						</View>
					)}
					<Text style={styles.deviceCount}>発見: {devices.length}台</Text>
				</View>
			</View>

			<FlatList
				data={devices}
				renderItem={renderDevice}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={renderEmpty}
				refreshControl={
					<RefreshControl
						refreshing={isScanning}
						onRefresh={onRefresh}
						colors={["#007AFF"]}
					/>
				}
				style={styles.deviceList}
			/>

			<View style={styles.footer}>
				<TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
					<Text style={styles.logoutButtonText}>ログアウト</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 20,
		paddingVertical: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#e6f3ff",
		marginBottom: 16,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	statusItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	statusText: {
		color: "#fff",
		marginLeft: 8,
		fontSize: 14,
	},
	deviceCount: {
		color: "#e6f3ff",
		fontSize: 14,
	},
	deviceList: {
		flex: 1,
		paddingHorizontal: 16,
	},
	deviceItem: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		marginVertical: 4,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	deviceInfo: {
		flex: 1,
	},
	deviceName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	deviceId: {
		fontSize: 12,
		color: "#666",
		marginBottom: 2,
	},
	deviceRssi: {
		fontSize: 12,
		color: "#666",
	},
	connectButton: {
		backgroundColor: "#007AFF",
		borderRadius: 6,
		paddingHorizontal: 16,
		paddingVertical: 8,
		minWidth: 60,
		alignItems: "center",
	},
	connectButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 48,
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 16,
	},
	refreshButton: {
		backgroundColor: "#007AFF",
		borderRadius: 6,
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	refreshButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
	footer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		backgroundColor: "#fff",
	},
	logoutButton: {
		backgroundColor: "#FF3B30",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	logoutButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
