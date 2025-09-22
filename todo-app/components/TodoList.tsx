import type React from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import type { Todo } from "../types/Todo";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
	todos: Todo[];
	onToggleTodo: (id: string) => void;
	onDeleteTodo: (id: string) => void;
	onEditTodo: (id: string, text: string) => void;
	filter: "all" | "active" | "completed";
	onFilterChange: (filter: "all" | "active" | "completed") => void;
}

export const TodoList: React.FC<TodoListProps> = ({
	todos,
	onToggleTodo,
	onDeleteTodo,
	onEditTodo,
	filter,
	onFilterChange,
}) => {
	const filteredTodos = todos.filter((todo) => {
		switch (filter) {
			case "active":
				return !todo.completed;
			case "completed":
				return todo.completed;
			default:
				return true;
		}
	});

	const completedCount = todos.filter((todo) => todo.completed).length;
	const activeCount = todos.length - completedCount;

	const renderTodo = ({ item }: { item: Todo }) => (
		<TodoItem
			todo={item}
			onToggle={onToggleTodo}
			onDelete={onDeleteTodo}
			onEdit={onEditTodo}
		/>
	);

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				{filter === "all" && "TODOがありません"}
				{filter === "active" && "未完了のTODOがありません"}
				{filter === "completed" && "完了したTODOがありません"}
			</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.statsContainer}>
				<Text style={styles.statsText}>
					全: {todos.length} | 未完了: {activeCount} | 完了: {completedCount}
				</Text>
			</View>

			<View style={styles.filterContainer}>
				<TouchableOpacity
					style={[styles.filterButton, filter === "all" && styles.activeFilter]}
					onPress={() => onFilterChange("all")}
				>
					<Text
						style={[
							styles.filterText,
							filter === "all" && styles.activeFilterText,
						]}
					>
						すべて
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.filterButton,
						filter === "active" && styles.activeFilter,
					]}
					onPress={() => onFilterChange("active")}
				>
					<Text
						style={[
							styles.filterText,
							filter === "active" && styles.activeFilterText,
						]}
					>
						未完了
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.filterButton,
						filter === "completed" && styles.activeFilter,
					]}
					onPress={() => onFilterChange("completed")}
				>
					<Text
						style={[
							styles.filterText,
							filter === "completed" && styles.activeFilterText,
						]}
					>
						完了
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={filteredTodos}
				renderItem={renderTodo}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={renderEmpty}
				style={styles.list}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	statsContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#f8f9fa",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	statsText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
	},
	filterContainer: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	filterButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderBottomWidth: 2,
		borderBottomColor: "transparent",
	},
	activeFilter: {
		borderBottomColor: "#007AFF",
	},
	filterText: {
		fontSize: 16,
		color: "#666",
	},
	activeFilterText: {
		color: "#007AFF",
		fontWeight: "bold",
	},
	list: {
		flex: 1,
	},
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 40,
	},
	emptyText: {
		fontSize: 16,
		color: "#999",
		textAlign: "center",
	},
});
