Expo + Firebase Auth + BLEでRaspberry Piセンサーデータを受信するAndroidアプリ実装ガイド
プロジェクト概要と要件

本ガイドでは Expo（React Native） 環境で Firebase Authentication（ユーザー認証）と Bluetooth Low Energy (BLE) 通信を組み合わせ、Raspberry Pi 4 をBLE周辺機器（ペリフェラル）としてセンサーデータを通知（Notify通信）し、Androidスマホがそれを受信・表示するアプリの実装方法を解説します。ターゲットはAndroidです（iOSには言及しません）。UIは最低限で構いません。本稿の目的は、ExpoでBLE通信とFirebase認証を組み合わせて体験するための包括的な手引きです。ライブラリ選定、Expo SDKの制約、EAS Build設定、コード例、BLEのスキャン・接続・通知ハンドリング、Firebase Auth設定などを順を追って 極限まで丁寧に 解説します。

使用技術とライブラリの選定

Expo（React Native）: Expoのマネージドワークフローを利用します。Expoは開発効率が高くReact Nativeアプリを素早く構築できますが、標準状態ではBLEのような一部ネイティブ機能に制約があります（後述）。

Firebase Authentication: ユーザー認証にはFirebaseのAuthサービスを使用します。ExpoではFirebaseのJavaScript SDKを利用することで追加のネイティブモジュールなしに認証機能を実装可能です
docs.expo.dev
。メール/パスワード認証など基本的な認証フローを扱います。

Bluetooth Low Energy (BLE): BLE通信にはReact Native対応のライブラリ react-native-ble-plx を使用します。このライブラリはBLEデバイスのスキャン、接続、サービス・キャラクタリスティクスの読み書き、通知受信(Notify)など包括的に扱えます。特にExpo向けにConfig Pluginによるサポートが提供されており、Expoでもネイティブコードを書かず利用できます
blog.theodo.com
。もう一つの代表的ライブラリにreact-native-ble-managerがありますが、こちらはExpoでの公式サポートがなく、Config Pluginも提供されていません
blog.theodo.com
。そのためExpo環境ではreact-native-ble-plxが適切です。

Expo Config Plugins: Expoでネイティブモジュール（今回のBLEや後述のFirebaseネイティブSDK利用時など）を使う際に、Config Pluginを利用して必要なネイティブ設定を自動適用します。これによりExpoでも"eject"（ベアワークフローへの移行）せずにBLE機能を追加できます
blog.theodo.com
。

Expo Dev Client（カスタム開発クライアント）: Expo Go（標準クライアント）はデフォルトでBLEや一部ネイティブモジュールを含まないため、そのままでは今回のアプリを開発・実行できません。代わりにEASビルドでネイティブモジュール組み込み済みのカスタム開発クライアントを作成し、開発時に使用します
blog.theodo.com
blog.theodo.com
。これによりExpoプロジェクトのままネイティブ機能をテストできます。

Expo SDKの制約とBLE利用への対応

Expo（マネージドワークフロー）は通常、ネイティブコードを直接含むパッケージを利用できません。BLEライブラリ（react-native-ble-plxなど）は内部でネイティブモジュールを使用するため、そのままではExpo Go上で動作しません
blog.theodo.com
。従来はExpoからBareワークフロー（eject）に切り替えてネイティブ依存を解決していました。しかし、現在はExpoのConfig Pluginsと**Development Build（開発ビルド）**の活用で、Expoでもネイティブモジュールを組み込めます。

対応戦略:

Expo Config Pluginの利用: Expoはapp.jsonまたはapp.config.jsでConfig Pluginを指定することで、ネイティブの設定（AndroidのPermissionやGradle依存関係など）を自動で組み込みます。react-native-ble-plxにはExpo公式のConfig Pluginが用意されています
blog.theodo.com
。これを使い、BLE機能に必要なパーミッションやBluetoothモードを宣言します。

EAS Buildでの開発クライアント作成: ExpoのEAS Buildを使って、BLEモジュール組み込み済みの開発用アプリをビルドします
blog.theodo.com
。Expoではexpo-dev-clientライブラリを導入し、developmentClient: true設定でビルドすることで、Expo Goのカスタム版のようなアプリを入手できます。これにより、開発中でもBLE等のネイティブ機能を動作させられます
blog.theodo.com
。したがって通常のExpo Goは使わず、独自のDev Clientを用いて開発・デバッグします。

Bareワークフローとの比較:
今回Expoのメリット（ホットリロードやOTAアップデート等）を活かすためBareには移行しません。ただし、Config Plugin未提供のネイティブ機能を使う場合や特殊なネイティブ改修が必要な場合はBare移行も選択肢です。今回はreact-native-ble-plxにExpo対応Config Pluginがあり、Firebase AuthはJS SDKで済むためBare移行不要です。

プロジェクトセットアップ手順

まず環境のセットアップから始めます。以下のステップでExpoプロジェクトの作成と必要ライブラリの追加、Expo設定を行います。

Expoプロジェクトの作成:
Expo CLIを使って新規プロジェクトを作成します。ターミナルで以下を実行してください。プロジェクト名は仮にexpo-ble-firebase-appとします。

npx create-expo-app expo-ble-firebase-app --template expo-template-blank-typescript


（TypeScriptテンプレートを使用していますが、JavaScriptでも構いません。）
コマンド実行後、ディレクトリを移動してプロジェクトを開きます。

cd expo-ble-firebase-app


作成直後のプロジェクトはExpo Goで動作するシンプルなテンプレートアプリです。

必要パッケージのインストール:
プロジェクトディレクトリで以下のパッケージを追加します。

BLEライブラリ: react-native-ble-plx（Expo対応Config Plugin含む）

Firebase JS SDK: firebase （Auth機能のため）

Expo Dev Client: 開発ビルド用クライアント
コマンド例:

npx expo install react-native-ble-plx expo-dev-client firebase


メモ: expo installを使うと互換性のあるバージョンがインストールされます。expo-dev-clientはReact Native Firebaseなどネイティブ依存追加時にも推奨されるライブラリで、開発用ビルドの土台となります
docs.expo.dev
docs.expo.dev
。

Expo Config Pluginの設定:
BLE機能のため、app.json（またはapp.config.js）にreact-native-ble-plx用のConfig Plugin設定を追加します。これによりAndroidのBluetooth権限や動作モードがアプリに組み込まれます。例として、app.jsonに以下を追記します（既存のexpoオブジェクト内にplugins項目を追加）。:

{
  "expo": {
    // ...（省略）他のExpo設定
    "plugins": [
      [
        "@config-plugins/react-native-ble-plx",
        {
          "isBackgroundEnabled": true,
          "modes": ["peripheral", "central"],
          "bluetoothAlwaysPermission": "Allow $(PRODUCT_NAME) to connect to bluetooth devices",
          "bluetoothPeripheralPermission": "Allow $(PRODUCT_NAME) to connect to bluetooth devices"
        }
      ]
    ]
  }
}


上記設定ではBLEを**中央（Central）**として使うことと、（今回は必要ありませんが）周辺機器モード有効化、およびBluetooth使用許可ダイアログに表示するメッセージを指定しています
blog.theodo.com
。AndroidではisBackgroundEnabled: trueとmodes指定によりバックグラウンドでのBLE動作や周辺機器モードの利用も可能にしています（今回はスマホはCentralとしてPiに接続）。
これによりExpoはビルド時に必要なAndroidManifest権限（BLUETOOTH_SCAN, BLUETOOTH_CONNECTなど）や周辺機器モード設定を自動付与します
blog.theodo.com
。

Firebaseプロジェクトの準備と設定:
Firebaseで新規プロジェクトを作成し、Authentication（認証）を有効化します。Email/Password認証を使う場合はコンソールでそのSign-in方法を有効にしてください。次に、このFirebaseプロジェクトにアプリを登録します（「Webアプリとして追加」します）。登録時に取得できるFirebase設定オブジェクト（APIキーやプロジェクトID等）は後でアプリから使います
docs.expo.dev
。
取得した設定値はfirebaseConfigとしてプロジェクト内に保存します。例えばfirebaseConfig.jsを作成し以下のように書きます:

// firebaseConfig.js
import { initializeApp } from 'firebase/app';
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  appId: 'your-app-id',
  // ...必要に応じてその他のキー（messagingSenderId等）
};
export const FirebaseApp = initializeApp(firebaseConfig);


このfirebaseConfigの値はFirebaseコンソールからコピーします。ExpoでFirebaseのJS SDKを使う場合、他にネイティブ設定ファイル（GoogleServices-Info.plistやgoogle-services.json）は不要です
docs.expo.dev
。（React Native用のネイティブSDKを使う場合のみそれらが必要ですが、本稿ではJS SDKで十分です。）

EASビルド設定:
BLEモジュールとExpo Dev Clientを組み込んだ開発ビルドを行うため、EASの設定ファイルeas.jsonをプロジェクト直下に作成します。例えば以下のように記述します:

{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "image": "latest"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}


ここではdevelopmentというビルドプロファイルを定義し、developmentClient: true（カスタムDev Clientを含める）かつdistribution: "internal"（社内配布用=Google Playではなく直接インストール用）としています
blog.theodo.com
。これによりBLEネイティブモジュールやexpo-dev-clientが含まれた開発用APKをビルドできます。

開発用ビルドの実行:
EASビルドを利用するにはExpoアカウントが必要です。eas loginでログイン後、以下のコマンドで開発ビルドをトリガーします。

npx eas build --profile development --platform android


（初回実行時はビルド証明書の設定など対話的に求められます。）
ビルドが完了すると、EASから内部配信用のAPKファイルを入手できます。Expoのビルドダッシュボードやビルド完了ログに表示されるQRコード/リンクからAPKをダウンロードし、ご自身のAndroid実機にインストールしてください
blog.theodo.com
。インストール後、そのアプリ（カスタムDev Client）を起動します。

Dev Clientでの開発サーバ接続: インストールした開発クライアントアプリは、通常のExpo Goと似ていますが、BLEなど追加機能入りです。PC側で開発サーバを起動しましょう:

npx expo start --dev-client


または yarn start --dev-client としても同様です
blog.theodo.com
。
QRコードを使ってデバイスのカスタムクライアントから接続すれば、Metroバンドルサーバに接続してアプリを開発モードで動かせます。以後はファイルを編集するとホットリロードされ、BLEやFirebase機能も組み込まれているため動作確認できます。

以上で、ExpoプロジェクトにBLEとFirebase Authの下準備が整いました。次章から具体的な機能実装に入ります。

Bluetooth Low Energy機能の実装

ここではRaspberry Piが周辺機器（ペリフェラル）として発信するBLEデータを、スマホ側（Central）がスキャン・接続し、Notify特性を購読（通知受信）してセンサーデータを取得・表示する処理を実装します。react-native-ble-plxライブラリのAPIを用いて順に説明します。

前提: Raspberry Pi側でBLEのGATTサーバーが設定され、特定のサービスUUIDとキャラクタリスティックUUIDを持ち、Notifyプロパティでセンサーデータを送信しているとします（具体的UUIDは仮定して解説します）。Piが定期的にセンサーデータ（例えば温度や湿度など）をNotify通知する状態です。

1. BLEモジュールの初期化と権限確認

最初にアプリ起動時、BLE制御のためのマネージャーを作成します。またAndroidではBLE利用にあたり実行時パーミッションの許可が必要です。Android 12以降では「近接デバイスの権限」としてBLUETOOTH_SCANやBLUETOOTH_CONNECTの許可が必要になります。さらにAndroid 10/11ではBLEスキャンに位置情報許可（ACCESS_FINE_LOCATION）が必要でした。
Config Pluginによりこれら権限はManifestに宣言済みですが、ユーザーに許可を求める処理が必要です
github.com
。

// App.tsx またはコンテキスト/カスタムフック内など適切な場所で
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const bleManager = new BleManager();

async function requestBlePermissions() {
  if (Platform.OS === 'android') {
    // Android向けに必要なパーミッションをリクエスト
    const permisions = [];
    if (Platform.Version >= 31) {  // Android 12+
      permisions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      permisions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
    } else {
      permisions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }
    for (const perm of permisions) {
      const granted = await PermissionsAndroid.request(perm);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('必要なBluetooth権限が許可されていません');
      }
    }
  }
}

// アプリ起動時に呼ぶ:
await requestBlePermissions();


上記で、必要なBLE関連の権限をユーザーにリクエストしています。一括で配列に入れてリクエストすることもできますが、説明のため逐次処理しています。

2. BLEデバイスのスキャン

センサーデバイス（Raspberry Pi）を見つけるためにBLEスキャンを開始します。BleManager.startDeviceScan()を使用すると、周辺のBLEペリフェラルを検出できます
blog.theodo.com
。オプションで特定のService UUIDをフィルタに指定可能ですが、ここでは簡単のためフィルタなしで全デバイスをスキャンし、該当デバイス名/UUIDをチェックします。

// スキャン結果を保存する状態（React Hooksのstateを利用する例）
const [scannedDevices, setScannedDevices] = useState<BleDevice[]>([]);
const TARGET_DEVICE_NAME = "RasPiSensor";  // あるいは事前にわかっているデバイス名/アドレス

function startScanForDevices() {
  // 既存のリストをクリア
  setScannedDevices([]);
  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error("スキャンエラー:", error);
      return;
    }
    if (device && device.name) {
      console.log("発見:", device.name, device.id);
      // ターゲット名のデバイス、または特定のサービスUUIDを持つデバイスを検出したら記録
      setScannedDevices(prev => {
        // 重複追加を避けつつデバイスを保存
        if (prev.find(d => d.id === device.id)) {
          return prev;
        }
        return [...prev, device];
      });
      // もし即時に目当てのデバイスを見つけて自動接続したい場合:
      if (device.name === TARGET_DEVICE_NAME) {
        bleManager.stopDeviceScan();
        connectToDevice(device.id);
      }
    }
  });
}

// 一定時間後にスキャン停止（例:10秒後）
setTimeout(() => bleManager.stopDeviceScan(), 10000);


上記コードでは:

bleManager.startDeviceScan(filter, options, callback)でスキャン開始しています。今回はfilterにnullを渡し全広告パケットを受信します。

コールバックでdeviceオブジェクトが渡されます。各デバイスについてdevice.nameやdevice.id（MACアドレス的な識別子）が取得できます。

TARGET_DEVICE_NAMEと一致する名前を持つデバイスを検出したら、それを記録し、必要に応じて自動でconnectToDeviceを呼び接続に進みます。ここでは便宜上デバイス名で判定していますが、安全にはService UUIDフィルタを使ったり、device.manufacturerData等から判断することもできます。

補足: scannedDevices状態に見つかったデバイスを保存しています。UI上にリスト表示してユーザーに選択させる場合、このリストを利用できます。最低限のUIではターゲットデバイスが一つと決め打ちなら自動接続でも構いません。

3. デバイスへの接続とサービス探索

スキャンで目当てのデバイスを見つけたら、BLEペリフェラルに接続します。BleManager.connectToDevice(deviceId)または取得したdeviceオブジェクトのdevice.connect()を用いて接続を確立できます
blog.theodo.com
。接続後、デバイス上のGATTサービスとキャラクタリスティクスを探索します（通知を購読するには事前にサービス/キャラクタリスティクスを発見しておく必要があります
blog.theodo.com
blog.theodo.com
）。

const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

async function connectToDevice(deviceId: string) {
  try {
    console.log("デバイスに接続中...", deviceId);
    const device = await bleManager.connectToDevice(deviceId);
    setConnectedDevice(device);
    console.log("接続成功:", device.name);
    // サービスとキャラクタリスティクスを探索
    await device.discoverAllServicesAndCharacteristics();
    console.log("サービスとキャラクタリスティクスを探索完了");
    // （オプション）特定のサービスUUIDを保持しておく
    const services = await device.services();
    const service = services.find(s => s.uuid === TARGET_SERVICE_UUID);
    // 必要ならservice.characteristics()でキャラクタリスティクス一覧取得も可能
  } catch (error) {
    console.error("デバイス接続エラー:", error);
  }
}

function disconnectFromDevice() {
  if (!connectedDevice) return;
  bleManager.cancelDeviceConnection(connectedDevice.id)
    .then(() => {
      console.log("切断しました");
      setConnectedDevice(null);
    })
    .catch(err => console.error("切断エラー:", err));
}


connectToDevice関数でデバイスIDを指定し接続します。接続成功するとDeviceオブジェクトが返り、状態変数connectedDeviceに保存しています
blog.theodo.com
。

接続後discoverAllServicesAndCharacteristics()を呼び出し、周辺機器が持つ全サービス・キャラクタリスティクスを探索します
blog.theodo.com
。この処理を行わないと、直後にキャラクタリスティクスへのアクセスができずエラーになるため必須です
blog.theodo.com
。

サービス一覧を取得し、自分が目当てとするサービス（例えばRaspberry Pi側で定義したセンサーサービスUUID）を検出できます。例えばTARGET_SERVICE_UUIDに該当するサービスを検索しています。さらにそのサービス内の特定のキャラクタリスティクスUUID（例えばセンサーデータ通知用のCharacteristic）も特定できます。

disconnectFromDevice関数では、cancelDeviceConnectionで切断します。切断後、状態をリセットします。

4. Notify特性の購読（センサーデータの受信）

最後に、Raspberry PiがNotifyで送信しているセンサーデータを購読（サブスクライブ）します。react-native-ble-plxでは、通知可能なCharacteristicに対してmonitorCharacteristicForServiceメソッドを呼ぶことで変更通知をコールバックで受け取れます
blog.theodo.com
。

前提: Pi側で「サービスUUID」と「キャラクタリスティクスUUID」が決まっている必要があります。仮にサービスUUIDをSENSOR_SERVICE_UUID、通知用キャラクタリスティクスUUIDをSENSOR_DATA_CHAR_UUIDとします。これらはPi側の実装に合わせて置き換えてください。

import { Buffer } from 'buffer';  // Base64デコードに使用

function subscribeSensorNotifications(device: Device) {
  if (!device) return;
  try {
    device.monitorCharacteristicForService(
      SENSOR_SERVICE_UUID,
      SENSOR_DATA_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error("通知購読エラー:", error);
          return;
        }
        if (!characteristic?.value) return;
        // Base64でエンコードされたデータをデコード
        const rawData = Buffer.from(characteristic.value, 'base64');
        // 例: UTF-8文字列としてデータを解釈
        const text = rawData.toString('utf8');
        console.log("受信したセンサーデータ:", text);
        // 状態変数に保存しUIに表示する
        setSensorData(text);
      }
    );
    console.log("センサーデータの通知を購読開始");
  } catch (err) {
    console.error("購読開始失敗:", err);
  }
}


device.monitorCharacteristicForService(serviceUUID, charUUID, callback)を使い、指定したサービス内のキャラクタリスティクスに対する通知を監視します
blog.theodo.com
。Pi側がそのCharacteristicにNotifyを設定し値を更新すると、コールバックが呼ばれます。

characteristic.valueには変更後の値がBase64エンコード文字列として入っています。BLEのバイナリーデータを表現するためです。bufferライブラリを使いBuffer.from(value, 'base64')でデコードできます
blog.theodo.com
。今回はセンサーデータがテキスト（例えば "24.5°C" など）と仮定し、UTF-8文字列に変換しています。

デコードした生データを必要に応じてパースします。たとえばCSV形式ならsplitする、JSON文字列ならJSON.parseする、単一数値ならNumberに変換する、といった処理です。

取得したセンサーデータはReactのstate（例: sensorData）に保存し、UI表示に反映させます。

購読停止: なおmonitorCharacteristicForServiceはデバイスとの接続が切れるまで通知を受け続けます。不要になったらsubscription.remove()で停止できます（monitorCharacteristicForServiceはSubscriptionを返すため）。

以上で、スマホアプリ側でBLEデバイスをスキャンし、接続してNotify通知を受け取る実装ができました。まとめると: スキャン開始
blog.theodo.com
→ デバイス発見 → 接続
blog.theodo.com
→ サービス探索
blog.theodo.com
→ 通知購読開始
blog.theodo.com
という流れになります。

Firebase Authenticationの設定と実装

次に、Firebase Authenticationによるユーザー認証機能をアプリに組み込みます。ここではEmail/Passwordによる簡単なログイン認証を例に、Expo（React Native）上でFirebase Authを利用する方法を解説します。

FirebaseプロジェクトとExpoでの設定

前準備として行ったFirebaseプロジェクトの設定をアプリに反映します。既にfirebaseConfig.jsでFirebaseアプリを初期化しましたが、Authサービスを使うにはさらにfirebase/authモジュールをインポートし、認証関数を呼び出す必要があります。

// firebaseConfig.js に追記または別ファイルでAuth機能を初期化
import { getAuth } from 'firebase/auth';

export const FirebaseAuth = getAuth(FirebaseApp);


上記でFirebaseAuthオブジェクトを作成しました。getAuth()にinitializeApp済みのFirebaseAppを渡すことで、そのプロジェクトに対するAuthインスタンスを取得します。ExpoではこのFirebase JS SDKをそのまま利用できます
docs.expo.dev
。（裏側ではネイティブコードを使わずHTTPS経由で認証処理が行われます。）

注: Firebase JS SDKはReact Native環境ではデフォルトでは認証状態（トークン）の永続化にローカルストレージを使用できません。Expoの場合、自動ではPersistenceされずメモリ保持となる可能性があります。必要に応じて@react-native-async-storage/async-storageをインストールし、Authに永続ストレージを設定することも可能です。ただし、シンプルな学習用途であれば毎回ログインさせる実装でも問題ありません。

ユーザー認証（ログイン・ログアウト）の実装

Firebase Authを使ってユーザーのログイン・ログアウト機能を実装します。ここではメールアドレスとパスワードでのサインアップ/ログインを扱います（Firebaseコンソールで有効にしてある前提）。

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { FirebaseAuth } from './firebaseConfig';

const [currentUser, setCurrentUser] = useState(null);

// Auth状態の監視（アプリ起動時に設定）
useEffect(() => {
  const unsubscribe = onAuthStateChanged(FirebaseAuth, (user) => {
    setCurrentUser(user);
    if (user) {
      console.log("ログイン中ユーザー:", user.email);
    } else {
      console.log("未ログイン状態");
    }
  });
  return () => unsubscribe();  // コンポーネントアンマウント時に監視解除
}, []);

async function handleSignUp(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
    console.log("サインアップ成功:", result.user.email);
  } catch (err) {
    console.error("サインアップ失敗:", err);
  }
}

async function handleLogin(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(FirebaseAuth, email, password);
    console.log("ログイン成功");
  } catch (err) {
    console.error("ログイン失敗:", err);
  }
}

async function handleLogout() {
  await signOut(FirebaseAuth);
  console.log("ログアウトしました");
}


認証状態の監視: onAuthStateChangedを使い、現在ログインしているユーザーの状態を監視します。これによりログインやログアウトの結果currentUserが自動更新されます。画面の切り替え（認証前/後）に利用できます。

ユーザー登録: createUserWithEmailAndPassword(auth, email, pass)で新規ユーザーを作成できます。成功すれば自動的にそのユーザーでログインされた状態になります。

ログイン: signInWithEmailAndPassword(auth, email, pass)で既存ユーザーのログイン。成功時は認証状態が保持され、上記のonAuthStateChangedでuserが取得できます。

ログアウト: signOut(auth)を呼ぶだけでログアウトできます。これもonAuthStateChangedで検知できます。

Expoでは以上の操作はネットワーク経由でFirebaseサービスと通信して行われます。特別なネイティブモジュール不要で、追加のExpo設定も不要です
docs.expo.dev
。

認証UIと画面遷移の簡略設計

UIは最低限で良いとのことなので、単一画面でログインフォームとセンサーデータ表示を条件付き表示する形にします。擬似コード的に説明します。

function App() {
  // ... Auth状態やセンサーデータ状態のフック

  if (!currentUser) {
    // 未ログイン時はログインフォームを表示
    return (
      <View style={styles.container}>
        <Text>ログインしてください</Text>
        <TextInput placeholder="メールアドレス" value={email} onChangeText={setEmail} />
        <TextInput placeholder="パスワード" value={pass} onChangeText={setPass} secureTextEntry />
        <Button title="ログイン" onPress={() => handleLogin(email, pass)} />
        <Button title="新規登録" onPress={() => handleSignUp(email, pass)} />
      </View>
    );
  }

  // ログイン済みの場合、センサーデータ画面を表示
  return (
      <View style={styles.container}>
        <Text>ようこそ！ {currentUser.email} さん</Text>
        {connectedDevice ? (
          <>
            <Text>接続中デバイス: {connectedDevice.name}</Text>
            <Text>センサーデータ: {sensorData ?? '---'}</Text>
            <Button title="切断" onPress={disconnectFromDevice} />
          </>
        ) : (
          <>
            <Button title="デバイスをスキャンして接続" onPress={startScanForDevices} />
            {scannedDevices.map(dev => (
              <Button key={dev.id} title={`接続: ${dev.name}`} onPress={() => connectToDevice(dev.id)} />
            ))}
          </>
        )}
        <Button title="ログアウト" onPress={handleLogout} />
      </View>
  );
}


未ログイン(currentUserがnull)の場合、メールアドレスとパスワードの入力フィールド、およびログイン・新規登録ボタンを表示します。

ログイン済みの場合、BLEデバイスの接続状況とセンサーデータを表示します。connectedDeviceが存在しない場合は「スキャンして接続」ボタンと、scannedDevices一覧から各デバイスに接続するボタンを表示します。connectedDeviceがあればそのデバイス名と、最新のsensorDataを表示し、切断ボタンを出します。

画面下部には常にログアウトボタンを配置し、押すとhandleLogoutが呼ばれてログアウト→認証状態がリセットされログイン画面に戻る、という流れです。

UIは質素ですが、Firebase Authによる認証フローとBLE接続フローの両方を一画面で体験できる構成になっています。認証後にのみセンサーデータを読み取る想定です。

Expo固有の考慮事項

最後に、Expo環境で今回の実装を行う際のプラットフォーム固有のポイントやトラブルシューティングを補足します。

AndroidのBLEパーミッション: Android 12以上ではユーザーに「近くのデバイスの検出」を許可させる必要があります。これはACCESS_FINE_LOCATIONではなくBLUETOOTH_SCAN/BLUETOOTH_CONNECTで行われます。Config Plugin設定で自動付与されたメッセージ（bluetoothPeripheralPermission等）はこの許可ダイアログに表示されます
blog.theodo.com
。ユーザーが許可しないとスキャンや接続ができないため、必ず権限周りのエラーハンドリングを実装してください。

バックグラウンド動作: isBackgroundEnabled: trueをConfig Pluginで指定しましたが、バックグラウンドで通知を受け取り続けるには追加の実装が必要です。Expoではタスクマネージャー等を使う方法がありますが、ここではフォアグラウンド前提で問題ありません。

BLEデータ形式: react-native-ble-plxでは、Characteristicの値はBase64文字列で提供されます。今回文字列データを想定しましたが、Pi側で例えば16bitのバイナリ値を送る場合、受信側ではBufferなどでバイト配列を取得し適切にエンコードする必要があります（例: 2バイトをInt16に変換など）。

接続の安定性: BLEは環境によっては接続不安定になる場合があります。ハンドリングとしてstartDeviceScan時に接続済みデバイスを除外する、connectToDevice時にタイムアウトを設ける、通知購読前にdiscoverAllServicesAndCharacteristics()を確実に呼ぶ、などのベストプラクティスがあります
blog.theodo.com
。

Expo更新: Expo SDKのバージョンアップに伴い、Config Pluginの設定項目や対応状況が変わる場合があります。常に最新のExpoドキュメントやライブラリREADMEを参照してください。

デバッグ: 開発ビルドしたアプリでは、Expo Go同様に開発者メニューが使用できます。ログ出力はExpo CLIのターミナルか、デバイスをUSB接続してadb logcatでも確認できます。BLEの接続状況はネイティブのログにも出力されることがあります。

まとめ

本記事では、Expo環境でFirebase認証とBLE通信を組み合わせ、Raspberry Piからのセンサーデータ通知をAndroidアプリで受信・表示する手順を詳細に解説しました。Expo Config PluginとEAS開発ビルドを駆使することで、Expoの利便性を保ったままネイティブ機能であるBLEを利用できました
blog.theodo.com
。また、FirebaseについてもExpoでそのままWeb SDKを使えるためシンプルに導入できました
docs.expo.dev
。

重要なポイントを振り返ります:

ライブラリ選定ではExpo対応状況を確認し、react-native-ble-plxを使用。Config PluginでBLE権限等を設定
blog.theodo.com
。

Expo Goでは動かないため、EAS BuildでDev Clientを作成して開発
blog.theodo.com
。

BLEの基本フロー（スキャン→接続→サービス探索→通知購読）を実装し、PiのNotify通信を受信
blog.theodo.com
。

Firebase AuthはJS SDKで手軽に導入し、メール認証によるログイン機能を実装。

認証後のみBLEデータを扱うようにし、UI上でシンプルに両者の機能を統合。

これにより、ユーザーはアプリ上でまずFirebaseログインし、その後BLEデバイス（Raspberry Pi）からのセンサーデータをリアルタイムに受け取る体験ができます。Expoの柔軟な拡張性とFirebaseのクラウドサービス、BLE IoTデバイスを連携させたプロジェクト構築の一助になれば幸いです。各ステップを丁寧に実施すれば、初心者でも動作確認までたどり着けるでしょう。ぜひ本ガイドを参考に、自身のプロジェクトでBLE×Firebaseを活用してみてください。

参考文献:

Expo公式ブログ: How to build a Bluetooth Low Energy powered Expo app（ExpoでBLE対応アプリを構築する方法）
blog.theodo.com
blog.theodo.com
blog.theodo.com
blog.theodo.com

Theodo Tech Blog: Communicating with BLE devices with Expo mobile apps（ExpoアプリでBLEデバイスと通信する）
blog.theodo.com
blog.theodo.com

Expo公式ドキュメント: Firebaseの利用方法（ExpoでFirebase JS SDKを利用）
docs.expo.dev
docs.expo.dev
 and Config Pluginsの解説
blog.theodo.com
.

React Native BLE PLXドキュメント: BLE APIリファレンスと使用例
blog.theodo.com
.

Firebase公式ドキュメント: Firebase Authentication（ウェブ向けJS SDKの案内。React Nativeでも利用可）
docs.expo.dev
.