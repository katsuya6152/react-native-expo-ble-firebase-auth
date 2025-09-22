import { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Alert,
} from "react-native";
import type { Todo } from "../types/Todo";

interface TodoItemProps {
	todo: Todo;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	onEdit: (id: string, text: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
	todo,
	onToggle,
	onDelete,
	onEdit,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(todo.text);

	const handleEdit = () => {
		if (editText.trim()) {
			onEdit(todo.id, editText);
			setIsEditing(false);
		} else {
			Alert.alert("エラー", "TODOの内容を入力してください");
		}
	};

	const handleCancel = () => {
		setEditText(todo.text);
		setIsEditing(false);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.checkbox}
				onPress={() => onToggle(todo.id)}
			>
				<Text style={styles.checkboxText}>{todo.completed ? "✓" : "○"}</Text>
			</TouchableOpacity>

			{isEditing ? (
				<View style={styles.editContainer}>
					<TextInput
						style={styles.editInput}
						value={editText}
						onChangeText={setEditText}
						autoFocus
						onSubmitEditing={handleEdit}
						returnKeyType="done"
					/>
					<TouchableOpacity style={styles.saveButton} onPress={handleEdit}>
						<Text style={styles.buttonText}>保存</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
						<Text style={styles.buttonText}>キャンセル</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.textContainer}>
					<Text
						style={[styles.text, todo.completed && styles.completedText]}
						onLongPress={() => setIsEditing(true)}
					>
						{todo.text}
					</Text>
					<Text style={styles.dateText}>
						{todo.createdAt.toLocaleDateString("ja-JP")}
					</Text>
				</View>
			)}

			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => onDelete(todo.id)}
			>
				<Text style={styles.deleteButtonText}>×</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		backgroundColor: "#fff",
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#007AFF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	checkboxText: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "bold",
	},
	textContainer: {
		flex: 1,
	},
	text: {
		fontSize: 16,
		color: "#333",
		marginBottom: 4,
	},
	completedText: {
		textDecorationLine: "line-through",
		color: "#999",
	},
	dateText: {
		fontSize: 12,
		color: "#999",
	},
	editContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	editInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#007AFF",
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginRight: 8,
		fontSize: 16,
	},
	saveButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		marginRight: 4,
	},
	cancelButton: {
		backgroundColor: "#FF3B30",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "bold",
	},
	deleteButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#FF3B30",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
	deleteButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});
