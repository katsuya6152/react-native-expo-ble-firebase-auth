import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";

interface AuthScreenProps {
	onSignIn: (email: string, password: string) => Promise<boolean>;
	onSignUp: (email: string, password: string) => Promise<boolean>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
	onSignIn,
	onSignUp,
}) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (!email.trim() || !password.trim()) {
			Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
			return;
		}

		if (password.length < 6) {
			Alert.alert("エラー", "パスワードは6文字以上で入力してください");
			return;
		}

		setIsLoading(true);

		try {
			const success = isSignUp
				? await onSignUp(email.trim(), password)
				: await onSignIn(email.trim(), password);

			if (!success) {
				Alert.alert(
					"エラー",
					isSignUp ? "サインアップに失敗しました" : "ログインに失敗しました",
				);
			}
		} catch (error) {
			Alert.alert("エラー", "予期しないエラーが発生しました");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={styles.title}>センサーアプリ</Text>
					<Text style={styles.subtitle}>
						Firebase認証でログインして{"\n"}BLEセンサーデータを受信
					</Text>
				</View>

				<View style={styles.form}>
					<TextInput
						style={styles.input}
						placeholder="メールアドレス"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						editable={!isLoading}
					/>

					<TextInput
						style={styles.input}
						placeholder="パスワード"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						autoCapitalize="none"
						autoCorrect={false}
						editable={!isLoading}
					/>

					<TouchableOpacity
						style={[styles.submitButton, isLoading && styles.disabledButton]}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.submitButtonText}>
								{isSignUp ? "サインアップ" : "ログイン"}
							</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.switchButton}
						onPress={() => setIsSignUp(!isSignUp)}
						disabled={isLoading}
					>
						<Text style={styles.switchButtonText}>
							{isSignUp
								? "既にアカウントをお持ちの方はこちら"
								: "アカウントをお持ちでない方はこちら"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	header: {
		alignItems: "center",
		marginBottom: 48,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 24,
	},
	form: {
		width: "100%",
	},
	input: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		marginBottom: 16,
	},
	submitButton: {
		backgroundColor: "#007AFF",
		borderRadius: 8,
		paddingVertical: 16,
		alignItems: "center",
		marginBottom: 16,
	},
	disabledButton: {
		backgroundColor: "#ccc",
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	switchButton: {
		alignItems: "center",
	},
	switchButtonText: {
		color: "#007AFF",
		fontSize: 14,
	},
});
