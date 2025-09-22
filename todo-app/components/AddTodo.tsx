import { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Text,
	StyleSheet,
	Alert,
} from "react-native";

interface AddTodoProps {
	onAddTodo: (text: string) => void;
}

export const AddTodo: React.FC<AddTodoProps> = ({ onAddTodo }) => {
	const [text, setText] = useState("");

	const handleAddTodo = () => {
		if (text.trim()) {
			onAddTodo(text);
			setText("");
		} else {
			Alert.alert("エラー", "TODOの内容を入力してください");
		}
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder="新しいTODOを入力..."
				value={text}
				onChangeText={setText}
				onSubmitEditing={handleAddTodo}
				returnKeyType="done"
				maxLength={100}
			/>
			<TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
				<Text style={styles.addButtonText}>追加</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#f8f9fa",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 16,
		backgroundColor: "#fff",
		marginRight: 8,
	},
	addButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
