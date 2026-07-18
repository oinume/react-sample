# React Nativeのナビゲーション

React Nativeアプリにおけるルーティング、画面遷移、ナビゲーションUIについての学習ノートです。

## React Nativeにナビゲーションライブラリが必要な理由

React Native本体には、画面遷移を管理するナビゲーション機能が含まれていません。そのため、ExpoおよびReact Nativeアプリでは、一般的に次のどちらかを利用します。

- **Expo Router**: ファイルとディレクトリの構成からルートを作る
- **React Navigation**: TypeScriptやJavaScriptのコードでNavigatorとScreenを定義する

新しいExpoプロジェクトでは、Expo Routerが推奨されています。

## ナビゲーションが管理するもの

ナビゲーションライブラリは、単に画面を切り替えるだけでなく、次のような処理を管理します。

- 一覧画面から詳細画面への移動
- ログイン画面からホーム画面への移動
- 戻るボタンやスワイプによる前画面への復帰
- 下部タブやサイドメニューによる画面の切り替え
- URLや通知から特定画面を直接開くDeep Link
- 画面遷移時のアニメーション
- ヘッダー、タイトル、戻るボタンなどの表示

代表的なナビゲーションレイアウトには、次のものがあります。

| レイアウト | 用途 |
| --- | --- |
| Stack | 画面を履歴として積み重ねる。一覧から詳細への移動など |
| Tabs | 下部などのタブから主要な画面を切り替える |
| Drawer | サイドメニューから画面を選択する |

## Expo RouterとReact Navigationの違い

| 項目 | Expo Router | React Navigation |
| --- | --- | --- |
| ルート定義 | ファイルベース | コードベース |
| 主な設定場所 | `src/app`以下の`_layout.tsx` | NavigatorおよびScreenの定義 |
| Deep Link | 各画面にURLが割り当てられる | 設定によって対応する |
| Web対応 | ファイルベースのURLと統合される | モバイルとWebのルーティングに対応する |
| 向いている用途 | 新しいExpoアプリ | コードでナビゲーション構造を細かく制御したいアプリ |

Expo Routerを選んでも、まったく異なるナビゲーションUIになるわけではありません。Expo RouterのStackなどはReact Navigationの仕組みを利用しているため、同じ種類のNavigatorを使えば、標準的な見た目と操作感はほぼ同じです。

主な違いは、ルートやUI設定を**どこで定義するか**です。

## Expo Routerのファイルベースルーティング

Expo Routerでは、`src/app`以下のファイルが画面になり、その位置からURLが決まります。

```text
src/app/
├── _layout.tsx       ナビゲーション全体の設定
├── index.tsx         /
├── about.tsx         /about
└── users/
    └── [id].tsx      /users/123 など
```

基本的なルールは次のとおりです。

1. `src/app`内のファイルは画面として扱われる
2. `index.tsx`は、そのディレクトリの入口になる
3. `_layout.tsx`でStackやTabsを設定する
4. `[id].tsx`のような名前で動的なルートを作れる
5. 通常のUIコンポーネントは`src/components`など、`src/app`の外に置く

### 最小構成

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}
```

```tsx
// src/app/index.tsx
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  return (
    <View>
      <Link href="/about">About画面へ</Link>
    </View>
  );
}
```

```tsx
// src/app/about.tsx
import { Text } from 'react-native';

export default function About() {
  return <Text>About画面</Text>;
}
```

`Link`を押すと`/about`へ移動します。Stackに画面履歴が積まれるため、標準の戻る操作も利用できます。

## 命令的な画面遷移

ボタンのイベントや処理結果に応じて移動する場合は、`router`を利用します。

```tsx
import { router } from 'expo-router';

router.navigate('/about'); // 通常の移動
router.push('/about');     // 新しい画面をStackに積む
router.replace('/login');  // 現在の画面を置き換える
router.back();             // 前の画面へ戻る
```

特に`push`と`replace`では、その後に戻れるかどうかが異なります。

- `push`: 現在の画面が履歴に残るため、通常は戻れる
- `replace`: 現在の画面を置き換えるため、置き換え前の画面には戻れない

## 戻るボタンなどのナビゲーションUI

Expo RouterとReact Navigationで同じNative Stackを使う場合、標準UIの違いはほとんどありません。どちらもプラットフォームに合わせた表示になります。

- iOS: シェブロン型の戻るアイコン。前画面のタイトルが表示される場合がある
- Android: 左向き矢印
- Stackの最初の画面: 戻るボタンは表示されない
- Stackの2画面目以降: 戻れる履歴があれば自動的に表示される

したがって、Expo Routerだから独自デザインになるわけではありません。ライブラリ間の違いよりも、iOSとAndroidのプラットフォーム差や、使用するNavigatorの違いのほうが大きくなります。

### Expo Routerでのヘッダー設定

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#007AFF',
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'ホーム',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="details"
        options={{
          title: '詳細',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
```

主な設定項目は次のとおりです。

| オプション | 内容 |
| --- | --- |
| `title` | ヘッダーのタイトル |
| `headerShown` | ヘッダー全体を表示するか |
| `headerTintColor` | タイトルや戻るボタンの色 |
| `headerStyle` | ヘッダーの背景色など |
| `headerBackVisible` | 戻るボタンを表示するか |
| `headerBackButtonDisplayMode` | iOSの戻るボタンにタイトルを表示するか |
| `headerLeft` | ヘッダー左側の独自UI |
| `headerRight` | ヘッダー右側の独自UI |

各画面から、その画面専用の設定を指定することもできます。

```tsx
import { Stack } from 'expo-router';
import { Button, Text } from 'react-native';

export default function Details() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '商品詳細',
          headerRight: () => <Button title="保存" onPress={() => {}} />,
        }}
      />
      <Text>商品情報</Text>
    </>
  );
}
```

React Navigationでも、Navigatorの`Screen`にほぼ同じ`options`を指定します。

## 戻るボタンが表示されないケース

戻るボタンは、ルート名だけではなくStackの履歴によって決まります。次のような場合には表示されないことがあります。

- Stackの最初の画面を表示している
- `replace`で現在の画面を置き換えた
- Deep Linkから詳細画面を直接開き、前画面がStackに存在しない
- `headerShown: false`や`headerBackVisible: false`を設定した
- `headerLeft`で標準の戻るボタンを置き換えた

Deep Linkで直接開いた画面にも戻り先を用意したい場合、Expo Routerでは`initialRouteName`や`Link`の`withAnchor`を利用できます。

## どちらを選ぶか

新しいExpoアプリでは、まずExpo Routerを選択すればよいでしょう。

- ファイル構成を見るだけで画面構造を理解できる
- Deep LinkとWebのURLを自然に扱える
- ルートの型チェックを利用できる
- StackやTabsの標準UIをそのまま利用できる

React Navigationは、ルート構造をコードで明示的に構築したい場合や、既存アプリですでに利用している場合に適しています。

どちらを選んでも、標準的なStackの戻るボタン、ヘッダー、遷移アニメーションは、使用するNavigatorとプラットフォームの影響を強く受けます。そのため、ルーティング方式とUIの見た目は分けて考えると理解しやすくなります。

## 推奨する学習順序

1. 2画面のStackを作る
2. `Link`と`router.push`の両方で遷移する
3. `router.replace`との履歴の違いを確認する
4. `[id].tsx`で動的ルートを作る
5. ヘッダーのタイトルと戻るボタンを設定する
6. TabsとStackを組み合わせる
7. Deep Linkから画面を直接開き、戻るボタンの挙動を確認する

## 参考資料

- [Navigation in Expo and React Native apps](https://docs.expo.dev/develop/app-navigation/)
- [Introduction to Expo Router](https://docs.expo.dev/router/introduction/)
- [Core concepts of file-based routing in Expo Router](https://docs.expo.dev/router/basics/core-concepts/)
- [Navigating between pages in Expo Router](https://docs.expo.dev/router/basics/navigation/)
- [Expo Router: Stack](https://docs.expo.dev/router/advanced/stack/)
- [React Navigation: Getting started](https://reactnavigation.org/docs/getting-started)
- [React Navigation: Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator)
