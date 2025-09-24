import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SensorData } from "../hooks/useBleNotification";

interface SensorDataScreenProps {
	deviceName: string;
	sensorData: SensorData | null;
	isSubscribed: boolean;
	onDisconnect: () => Promise<void>;
	onLogout: () => Promise<boolean>;
}

export const SensorDataScreen: React.FC<SensorDataScreenProps> = ({
	deviceName,
	sensorData,
	isSubscribed,
	onDisconnect,
	onLogout,
}) => {
	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString("ja-JP");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>センサーデータ</Text>
				<Text style={styles.deviceName}>{deviceName}</Text>
				<View style={styles.statusContainer}>
					<View
						style={[
							styles.statusDot,
							isSubscribed ? styles.connected : styles.disconnected,
						]}
					/>
					<Text style={styles.statusText}>
						{isSubscribed ? "接続中" : "接続待機中"}
					</Text>
				</View>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{!isSubscribed ? (
					<View style={styles.waitingContainer}>
						<ActivityIndicator size="large" color="#007AFF" />
						<Text style={styles.waitingText}>
							センサーデータの受信を待機中...
						</Text>
					</View>
				) : sensorData ? (
					<View style={styles.dataContainer}>
						<View style={styles.dataHeader}>
							<Text style={styles.dataTitle}>最新データ</Text>
							<Text style={styles.dataTimestamp}>
								{formatTimestamp(sensorData.timestamp)}
							</Text>
						</View>

						<View style={styles.dataContent}>
							<Text style={styles.dataText}>{sensorData.data}</Text>
						</View>

						<View style={styles.rawDataContainer}>
							<Text style={styles.rawDataTitle}>生データ (Hex)</Text>
							<Text style={styles.rawDataText}>
								{Array.from(sensorData.rawData)
									.map((byte) => byte.toString(16).padStart(2, "0"))
									.join(" ")}
							</Text>
						</View>

						<View style={styles.infoContainer}>
							<Text style={styles.infoTitle}>データ情報</Text>
							<Text style={styles.infoText}>
								データサイズ: {sensorData.rawData.length} bytes
							</Text>
							<Text style={styles.infoText}>
								受信時刻: {formatTimestamp(sensorData.timestamp)}
							</Text>
						</View>
					</View>
				) : (
					<View style={styles.noDataContainer}>
						<Text style={styles.noDataText}>
							センサーデータを受信していません
						</Text>
						<Text style={styles.noDataSubtext}>
							Raspberry Piからデータが送信されるまでお待ちください
						</Text>
					</View>
				)}
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity
					style={styles.disconnectButton}
					onPress={onDisconnect}
				>
					<Text style={styles.disconnectButtonText}>デバイスを切断</Text>
				</TouchableOpacity>

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
	deviceName: {
		fontSize: 16,
		color: "#e6f3ff",
		marginBottom: 12,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 8,
	},
	connected: {
		backgroundColor: "#4CAF50",
	},
	disconnected: {
		backgroundColor: "#FF9800",
	},
	statusText: {
		color: "#fff",
		fontSize: 14,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	waitingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 48,
	},
	waitingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
	dataContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	dataHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	dataTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	dataTimestamp: {
		fontSize: 12,
		color: "#666",
	},
	dataContent: {
		backgroundColor: "#f8f9fa",
		borderRadius: 6,
		padding: 12,
		marginBottom: 16,
	},
	dataText: {
		fontSize: 16,
		color: "#333",
		fontFamily: "monospace",
	},
	rawDataContainer: {
		marginBottom: 16,
	},
	rawDataTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#666",
		marginBottom: 8,
	},
	rawDataText: {
		fontSize: 12,
		color: "#666",
		fontFamily: "monospace",
		backgroundColor: "#f8f9fa",
		padding: 8,
		borderRadius: 4,
	},
	infoContainer: {
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		paddingTop: 12,
	},
	infoTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#666",
		marginBottom: 8,
	},
	infoText: {
		fontSize: 12,
		color: "#666",
		marginBottom: 4,
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 48,
	},
	noDataText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 8,
	},
	noDataSubtext: {
		fontSize: 14,
		color: "#999",
		textAlign: "center",
	},
	footer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		backgroundColor: "#fff",
	},
	disconnectButton: {
		backgroundColor: "#FF9800",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
		marginBottom: 8,
	},
	disconnectButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
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
