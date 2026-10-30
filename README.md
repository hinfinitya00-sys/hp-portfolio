# 翼工業ホームページ

公開: https://tsubasa-kogyo-fukuoka.com/
GitHub Pages: main ブランチのルート。公開元はこのディレクトリです。

## ローカル確認

```sh
npm ci
npx playwright install chromium webkit
npm run dev
npm run check
git diff --check
```

PCとスマートフォンで表示・メニュー・採用導線・フォーム必須入力・3D停止を確認してから、対象ファイルだけをコミットして main に push します。GitHub Pages のビルド成功と本番表示も確認してください。個人ファイルや別アプリをまとめて追加しないでください。

## 3D制作環境

Vite 8.3.5 の開発サーバー（http://127.0.0.1:4200/）、Playwright 1.64.1（Chromium / Android / WebKit iPhone）、Khronos glTF Validator をセットアップ。依存関係は package-lock.json で固定しています。

Three.js 0.160.1 をローカル配信。Blender 5.2 LTS で作成した独自の地形GLBをDraco圧縮しています。3Dは施工イメージであり実際の施工実績写真ではありません。チーム写真は既存の images/team.jpg です。

編集元: `_source/tsubasa-terrain.blend`。手続き生成から再構築する場合:

```sh
node _source/export-scene.mjs
blender --background --python _source/build_asset.py
```

中間JSONはコミット不要。`_source` は GitHub Pages/Jekyll の通常処理で公開対象外です。
描画失敗時は WebP に切り替え、画面外・非表示時には描画を停止します。動きを減らすOS設定にも対応しています。

## 掲載内容・送信

代表: 秋中久佳（あきなか ひさよし）。募集は従業員としての法面工事の作業員のみ。未確認の給与・休日・待遇は追記しないでください。
フォームは既存の Formspree エンドポイントを使用。テストはモック応答で成功・失敗・入力保持を検証し、会社への実メールは送信していません。実際の受信箱への到達は別途確認が必要です。

参考研究: Lusion https://lusion.co/ 、Bruno Simon https://bruno-simon.com/ 、日特建設 https://www.nittoc.co.jp/recruit/ 。構成や動きの研究のみで、他社の画像・動画は使用していません。

表面素材は Poly Haven の CC0 撮影素材（Sparse Grass / Rough Concrete）。詳細は assets/textures/ATTRIBUTION.md。PNG代替画像は `_source/render_poster.py` で生成しWebPへ変換します。
