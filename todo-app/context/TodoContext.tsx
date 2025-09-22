import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Todo, TodoContextType } from "../types/Todo";

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const STORAGE_KEY = "@todos";

export const TodoProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [todos, setTodos] = useState<Todo[]>([]);

	const loadTodos = useCallback(async () => {
		try {
			const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
			if (storedTodos) {
				const parsedTodos = JSON.parse(storedTodos).map(
					(todo: {
						id: string;
						text: string;
						completed: boolean;
						createdAt: string;
					}) => ({
						...todo,
						createdAt: new Date(todo.createdAt),
					}),
				);
				setTodos(parsedTodos);
			}
		} catch (error) {
			console.error("TODOの読み込みに失敗しました:", error);
		}
	}, []);

	const saveTodos = useCallback(async () => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		} catch (error) {
			console.error("TODOの保存に失敗しました:", error);
		}
	}, [todos]);

	const addTodo = (text: string) => {
		const newTodo: Todo = {
			id: Date.now().toString(),
			text: text.trim(),
			completed: false,
			createdAt: new Date(),
		};
		setTodos((prev) => [newTodo, ...prev]);
	};

	const toggleTodo = (id: string) => {
		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		);
	};

	const deleteTodo = (id: string) => {
		setTodos((prev) => prev.filter((todo) => todo.id !== id));
	};

	const editTodo = (id: string, text: string) => {
		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id ? { ...todo, text: text.trim() } : todo,
			),
		);
	};

	const value: TodoContextType = {
		todos,
		addTodo,
		toggleTodo,
		deleteTodo,
		editTodo,
	};

	// アプリ起動時にローカルストレージからTODOを読み込み
	useEffect(() => {
		loadTodos();
	}, [loadTodos]);

	// TODOが変更されるたびにローカルストレージに保存
	useEffect(() => {
		saveTodos();
	}, [saveTodos]);

	return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodos = () => {
	const context = useContext(TodoContext);
	if (context === undefined) {
		throw new Error("useTodos must be used within a TodoProvider");
	}
	return context;
};
