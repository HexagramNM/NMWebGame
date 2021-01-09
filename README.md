# NMWebGame
画像表示や音声再生、キーボード入力などをサポートしたブラウザゲーム用のエンジンです。
[落ちものパズルゲーム「長屋合宿を取り戻せ！」](http://nmsgameproject.web.fc2.com/nagayaGassyukuPuzzle/nagayaGassyukuPuzzle.html)で使用しております。

このエンジンですでに実装している機能は以下の通りです。
- 画像表示（分割読み込み、縮小拡大表示、回転表示、トリミング表示）
- 音声再生（ループ再生）
- キーボード入力（スマートフォン用インタフェースにも対応）
- マウス入力（クリック、マウス位置取得）
- Twitter共有

# 使用方法

## エンジン初期化
### `nmGameInit(gameInit, gameLoading, gameMain, gameTweet)`
- `gameInit`...初期化時に一度呼ぶ関数（画像や音声のロードなど）
- `gameLoading`...画像や音声ロード中に毎フレーム呼ぶ関数（ローディング画面の表示など）
- `gameMain`...画像や音声ロード完了後に毎フレーム呼ぶ関数（メイン処理）
- `gameTweet`...ツイートボタンを押されたときにツイートに入れる文字列を決める関数。返り値に文字列を返すようにする。nullを指定するとツイートボタンが非表示になる。

この関数を`index.html`のbodyタグのonloadで指定します。
 

## 画像表示
### `new ImageManager(source, i_divX, i_divY)`
- `source`...画像のパス
- `i_divX`...横方向の分割数
- `i_divY`...縦方向の分割数

画像をロードします。`i_divX`, `i_divY`を指定することで、横や縦にその数分画像を分割します。画像の表示の際は、この`ImageManager`クラスのメソッドを使用します。

### `ImageManager.drawImage(x, y, divXId, divYId)`
- `x`...表示場所のx座標。画像の左端がこのx座標になります。
- `y`...表示場所のy座標。画像の上端がこのy座標になります。
- `divXId`...左から(`divXId` + 1)番目の分割画像を使用します。
- `divYId`...上から(`divYId` + 1)番目の分割画像を使用します。

指定した位置に画像を表示します。

### `ImageManager.drawImageWithScaleTrimOpacity(x, y, divXId, divYId, xScale, yScale, xStartRate, xEndRate, yStartRate, yEndRate, opacity)`
- `x`...表示場所のx座標。（切り取られる部分を含めた）画像の左端がこのx座標になります。
- `y`...表示場所のy座標。(切り取られる部分を含めた)画像の上端がこのy座標になります。
- `divXId`...左から(`divXId` + 1)番目の分割画像を使用します。
- `divYId`...上から(`divYId` + 1)番目の分割画像を使用します。
- `xScale`...横方向の画像の拡大率です。1.0で等倍です。
- `yScale`...縦方向の画像の拡大率です。1.0で等倍です。
- `xStartRate`...横方向の開始地点の割合。例えば左から10%の部分を切り取る場合は0.1と指定します。
- `xEndRate`...横方向の終了地点の割合。例えば右から20%の部分を切り取る場合は0.8と指定します。
- `yStartRate`...縦方向の開始地点の割合。例えば上から10%の部分を切り取る場合は0.1と指定します。
- `yEndRate`...縦方向の終了地点の割合。例えば下から20%の部分を切り取る場合は0.8と指定します。
- `opacity`...不透明度。0.0で完全に透明になり、1.0で完全に不透明になります。

指定した位置に画像を拡大、トリミングをした状態で表示します。

### `ImageManager.drawImageWithRotateScaleOpacity(x, y, divXId, divYId, rotateRad, xScale, yScale,  opacity)`
- `x`...表示場所のx座標。画像の中心がこのx座標になります。
- `y`...表示場所のy座標。画像の中心がこのy座標になります。
- `divXId`...左から(`divXId` + 1)番目の分割画像を使用します。
- `divYId`...上から(`divYId` + 1)番目の分割画像を使用します。
- `rotateRad`...指定した角度だけ、時計回りに画像を回転します。角度の単位はラジアンです。
- `xScale`...横方向の画像の拡大率です。1.0で等倍です。
- `yScale`...縦方向の画像の拡大率です。1.0で等倍です。
- `opacity`...不透明度。0.0で完全に透明になり、1.0で完全に不透明になります。

指定した位置に画像を回転、拡大した状態で表示します。

### `drawRect(x, y, width, height, r, g, b, opacity)`
- `x`...表示場所のx座標。四角形の左端がこのx座標になります。
- `y`...表示場所のy座標。四角形の上端がこのy座標になります。
- `width`...四角形の幅
- `height`...四角形の高さ
- `r`...四角形の色の赤成分
- `g`...四角形の色の緑成分
- `b`...四角形の色の青成分
- `opacity`...不透明度。0.0で完全に透明になり、1.0で完全に不透明になります。

指定した位置に四角形を描画します。

### `fillCanvas(r, g, b, opacity)`
- `r`...塗りつぶす色の赤成分
- `g`...塗りつぶす色の緑成分
- `b`...塗りつぶす色の青成分
- `opacity`...不透明度。0.0で完全に透明になり、1.0で完全に不透明になります。

画面全体を指定した色で塗りつぶします。

### `drawText(x, y, text, size, color, align, font)`
- `x`...表示するx座標
- `y`...表示するy座標。テキストの上端がこのy座標になります。
- `text`...表示するテキスト
- `size`...表示するテキストのフォントサイズ
- `color`...テキストの色。白の場合は`"rgb(255, 255, 255)"`のように指定する。（ダブルクオーテーションも必要）
- `align`...`"left"`だとテキストの左端が指定したx座標に、`"center"`だとテキストの中心が指定したx座標に、`"right"`だとテキストの右端が指定したx座標になります。
- `font`...表示するテキストのフォント名

指定した位置にテキストを表示します。


## 音声表示
### `new SoundManager(filePath, localVolume, isLoop, loopStartSec, endTime)`
- `filePath`...音声のパス
- `localVolume`...音声の音量の倍率。
- `isLoop`...trueなら音声をループさせ、falseなら音声の終了地点で音声を停止します。
- `loopStartSec`...音声ループ時の開始地点（秒）
- `endTime`...音声の終了地点（秒）。nullを指定することで、最後まで再生します。

音声をロードします。音声再生の際はこの`SoundManager`クラスのメソッドを使用します。

### `SoundManager.play(isFromStart)`
- `isFromStart`...trueなら最初から音声を再生し、falseなら途中から音声を再生します。

音声を再生します。

### `SoundManager.playRate(rate)`
- `rate`...音声の再生速度の倍率。1.0で通常のスピードになります。

音声の再生速度を変更します。

### `SoundManager.pause()`
音声を停止します。

## キーボード入力

## マウス入力

## Twitter共有
