import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { FirebaseAuth } from '../firebaseConfig';

// エラーメッセージの取得
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません';
    case 'auth/wrong-password':
      return 'パスワードが間違っています';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます（6文字以上）';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらく待ってから再試行してください';
    default:
      return '認証エラーが発生しました';
  }
};

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FirebaseAuth, (user) => {
      setUser(user);
      setIsLoading(false);
      
      if (user) {
        console.log('ログイン中ユーザー:', user.email);
      } else {
        console.log('未ログイン状態');
      }
    });

    return () => unsubscribe();
  }, []);

  // サインアップ
  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
      console.log('サインアップ成功:', result.user.email);
      return true;
    } catch (error: any) {
      console.error('サインアップ失敗:', error);
      setError(getAuthErrorMessage(error.code));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ログイン
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      await signInWithEmailAndPassword(FirebaseAuth, email, password);
      console.log('ログイン成功');
      return true;
    } catch (error: any) {
      console.error('ログイン失敗:', error);
      setError(getAuthErrorMessage(error.code));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ログアウト
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await signOut(FirebaseAuth);
      console.log('ログアウトしました');
      return true;
    } catch (error: any) {
      console.error('ログアウト失敗:', error);
      setError(error.message);
      return false;
    }
  }, []);

  // エラーのクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
};
