import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView, Alert } from "react-native";
import { TodoProvider, useTodos } from "./context/TodoContext";
import { AddTodo } from "./components/AddTodo";
import { TodoList } from "./components/TodoList";

const AppContent = () => {
	const { todos, addTodo, toggleTodo, deleteTodo, editTodo } = useTodos();
	const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

	const handleDeleteTodo = (id: string) => {
		Alert.alert("TODOを削除", "このTODOを削除しますか？", [
			{ text: "キャンセル", style: "cancel" },
			{ text: "削除", style: "destructive", onPress: () => deleteTodo(id) },
		]);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>TODOアプリ</Text>
				<Text style={styles.subtitle}>{todos.length}個のタスク</Text>
			</View>

			<AddTodo onAddTodo={addTodo} />

			<TodoList
				todos={todos}
				onToggleTodo={toggleTodo}
				onDeleteTodo={handleDeleteTodo}
				onEditTodo={editTodo}
				filter={filter}
				onFilterChange={setFilter}
			/>

			<StatusBar style="auto" />
		</SafeAreaView>
	);
};

export default function App() {
	return (
		<TodoProvider>
			<AppContent />
		</TodoProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 20,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		color: "#e6f3ff",
	},
});
